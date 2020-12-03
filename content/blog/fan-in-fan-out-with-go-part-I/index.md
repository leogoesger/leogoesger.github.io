---
title: Fan in and Fan out Pattern with Go Part I
date: "2020-12-01T22:12:03.284Z"
draft: false
tags: ["coding"]
ogimage: "./meta.jpeg"
---

At Foodnome, I was tasked to create a KPI(key performance metrics) dashboard to better understand how our business is doing. Many of the KPIs are calculated month by month, and some of the KPIs require data from adjacent months. We quickly thought of using Go with the fan-out and fan-in pattern to solve the problem concurrently. This post uses simple examples explaining how we build out the concurrency modal.

## What is fan-in and fan-out

In our original problem, we want to calculate one set of metrics for each month, a total of 12 months. An easy way to solve this is to assign one worker and have it work out all 12 metrics. If each month takes about one min to calculate, it will take 12 mins.

We can agree this is way too slow. In Go, we can use concurrently programming to dedicate 12 workers (fan-out) and each worker can calculate one of the 12 month's metrics.

Once all 12 workers finish their calculation, we could regroup their data (fan-in). All the communication between them is done through Channels.

## Channels

Channel facilitates all the communication between Gorountinues. A few key ideas are very important to understand about channels.

- Sending and receiving of a channel is blocking
- You cannot send to a closed channel
- You can receive from a closed channel via `comma ok`
- It is ok to have an unequal amount of senders and receivers if they are within a goroutine
- `range` will only not stop receiving util channel is closed

These are rather confusing at first, but it will make more sense through the following examples.

#### - Sending and receiving of a channel is blocking

It is very common to see error messages like _fatal error: all goroutines are asleep - deadlock!_. And this is always caused by either trying to send to the channel without a receiver or visa versa.

```go
func main() {
    c := make(chan int)
    c <- 0
    fmt.Println(<-c)
}
```

```
// output:
fatal error: all goroutines are asleep - deadlock!
```

Code: [https://play.golang.org/p/LIw9Wvf9CEH](https://play.golang.org/p/LIw9Wvf9CEH)

`c` is a channel that takes type `int`. Next line we are sending `0` to the channel, and hoping to get it to print with `fmt.Println(<-c)`. Running this problem will cause an error _deaklock!_. This is because `c <- 0` is a sender, and sending to a channel blocks the program. The program will wait there for a receiver. The key is to ensure there are receiver and sender at the same time.

There are a few ways to solve this, but the idea is the same which is to make sure there is a receiver when the sender sends the data.

Here is option 1. Using `go func(){...}()`, we are sending the receiver out. By the time the program reaches the sender `c <- 0`, the receiver is ready.

```go
func main() {
    c := make(chan int)
    go func (){
        fmt.Println(<-c)
    }()
    c <- 0
}
```

```
// output:
0
```

Code: [https://play.golang.org/p/aC8TcH-BKCO](https://play.golang.org/p/aC8TcH-BKCO)

Option 2. Similar to option 1, but instead we put the sender into goroutine. By the time program reaches the receiver, the receiver waits until the sender sends the data.

```go
func main() {
    c := make(chan int)
    go func() {
        c <- 0
    }()
    fmt.Println(<-c)
}
```

```
// output:
0
```

Code: [https://play.golang.org/p/LQsFPnv4dlr](https://play.golang.org/p/LQsFPnv4dlr)

Option 3. The last option is a bit more interesting. We could send both sender and receiver out. The reason we added `time.Sleep` is because the program would otherwise exit.

```go
func main() {
    c := make(chan int)
    go func() {
        c <- 0
    }()
    go func() {
        fmt.Println(<-c)
    }()

    time.Sleep(time.Duration(rand.Intn(1e3)) * time.Millisecond)
    fmt.Println("Done")
}
```

```
// output:
0
Done
```

Code: [https://play.golang.org/p/uh3jROTIDue](https://play.golang.org/p/uh3jROTIDue)

#### - You cannot send to a closed channel

When a channel is closed, sending additional data would cause the program to panic. This idea is not hard to understand, but it is important to always remember to close the channel from the sender, NOT at the receiver.

```go
func main() {
    c := make(chan int)

    go func() {
        fmt.Println(<-c)
    }()
    c <- 0

    close(c)
    c <- 1
}
```

```
// output
0
panic: send on closed channel
```

Code: [https://play.golang.org/p/2jMjFMv1198](https://play.golang.org/p/2jMjFMv1198)

#### - You can receive from a closed channel and check via `comma ok`

When receiving from a closed channel, there will not be panic. The value returned from the channel would be the zero value of that type. You can also verify if the channel is closed with `, ok`

```go
func main() {
    c := make(chan int)
    go func() {
        fmt.Println(<-c)
    }()
    c <- 42
    close(c)

    fmt.Println(<-c)

    v, ok := <-c
    fmt.Println(v, ok)
}
```

```
// output:
42
0
0 false
```

Code: [https://play.golang.org/p/AfbmQEZvkua](https://play.golang.org/p/AfbmQEZvkua)

#### - It is ok to have an unequal amount of senders and receivers if they are within a goroutine

This is similar to the first point, but emphasizes the idea once the `main` goroutine exits, all the other goroutines exit as well. You don't have to worry about the unpaired senders or receivers in the goroutine. This would not be the case if either one is in the main goroutine(the one that runs the function main).

Here we have four receivers and one sender. One of the receivers will receive the data from the sender `c <- 0`, then the program exists with the three other receivers.

```go
func main() {
    c := make(chan int)

    go func() {
        fmt.Println(<-c, "e")
    }()
    go func() {
        fmt.Println(<-c, "l")
    }()
    go func() {
        fmt.Println(<-c, "o")
    }()
    go func() {
        fmt.Println(<-c, "p")
    }()
    c <- 0
}
```

```
// output
0 p
```

Code: [https://play.golang.org/p/Q8jGkGUu2wa](https://play.golang.org/p/Q8jGkGUu2wa)

#### - `range` will NOT stop recieving util channel is closed

Some of these examples I listed above are not very practical, but it is important to understand. `range` on the other hand is very commonly used since you do not know how many receivers you typically would need. When using `range`, remember the range will always create one more receiver until it is closed.

Running the following example will produce the `deadlock` error. At the third iteration of `range`, it creates another `<-c` and waits for the sender. Since it isn't in a goroutine, therefore the program deadlocks.

```go
func main() {
    c := make(chan int)

    go func() {
        for i := 0; i < 3; i++ {
            c <- i
        }
    }()

    for v := range c {
        fmt.Println(v)
    }

}
```

```
// output
0
1
2
fatal error: all goroutines are asleep - deadlock!
```

Code: [https://play.golang.org/p/o3a9xvFf9fv](https://play.golang.org/p/o3a9xvFf9fv)

You can solve this in two ways. Using rule number 4 or close the channel. Here is the program using rule number 4. Again, use `time.Sleep` to block the program from exiting.

```go
func main() {
    c := make(chan int)

    // sender
    go func() {
        for i := 0; i < 3; i++ {
            c <- i
        }
    }()

    // receiver
    go func() {
        for v := range c {
            fmt.Println(v)
        }
    }()

    time.Sleep(time.Duration(rand.Intn(1e3)) * time.Millisecond)
    fmt.Println("Done")
}
```

```
// output
0
1
2
Done
```

Code: [https://play.golang.org/p/CAbj07fzlyK](https://play.golang.org/p/CAbj07fzlyK)

Or `close` the channel. Remember once the channel is closed, you could no longer sending more data into it. And make sure to close the channel with the sender.

```go
func main() {
    c := make(chan int)

    // sender
    go func() {
        for i := 0; i < 3; i++ {
            c <- i
        }
        // close channel at sender
        close(c)
    }()

    // receiver
    for v := range c {
        fmt.Println(v)
    }
}
```

```
// output
0
1
2
```

Code: [https://play.golang.org/p/muIb10SrdIM](https://play.golang.org/p/muIb10SrdIM)

That's it for all my key take aways on channels. Next we can talk about the fan-in and fan-out pattern using channels.
