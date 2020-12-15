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

We can agree this is way too slow. In Go, we can use concurrent programming to dedicate 12 workers (fan-out) and each worker can calculate one of the 12 month's metrics.

Once all 12 workers finish their calculation, we could regroup their data (fan-in). Before implementing this pattern, we need to understand channels since all communications between Goroutines is done through Channels.

## Channels

Channel facilitates all the communication between Goroutines. A few key ideas are very important to understand about channels.

- Sending and receiving of an unbuffered channel is blocking
- You cannot send to a closed channel
- You can receive from a closed channel via `comma ok`
- It is ok to have an unequal amount of senders and receivers if they are within a goroutine
- `range` will stop receiving only when that channel is closed

These are rather confusing at first, but it will make more sense through these examples.

#### - Sending and receiving of an unbuffered channel is blocking

Unbuffered channel gives you the guarantee between the sender and receiver (receiver needs to be there first, maybe a few ns). Buffered channel, on the other hand, does not offer the guarantee, but it does not block. With that, it also comes with the risk. You could potentially send to a buffered channel with no receiver.

It is very common to see error messages like _fatal error: all goroutines are asleep - deadlock!_. This is caused by sending to the channel without a receiver or visa versa.

In the program below, `c` is a channel that takes type `int`. We are sending `0` to that channel, and hoping to get it to print with `fmt.Println(<-c)`. It will cause an error _deaklock!_ because `c <- 0` is a sender, and sending to a channel blocks the program. The program will wait at line for a receiver.

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

There are a few ways to solve this, but the idea is the same which is to make sure there is a receiver when the sender sends the data.

Here is option 1. Using anonymous Goroutines function `go func(){...}()`, we are sending the receiver out. By the time the program reaches the sender `c <- 0`, the receiver is ready.

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

Option 3. Use a buffered channel. Again, buffered channel losses that guarantee. You could remove line 10 and the program still runs with no error, but it is not blocking at line 4.

```go
func main() {
	c := make(chan int, 1)

	c <- 0

	ms := time.Duration(rand.Intn(1e3)) * time.Millisecond
	fmt.Printf("Working %v \n", ms)
	time.Sleep(time.Duration(rand.Intn(1e3)) * time.Millisecond)

	fmt.Println(<-c)
}
```

```
// output:
0
```

Code: [https://play.golang.org/p/GDuYt8xoLCd](https://play.golang.org/p/GDuYt8xoLCd)

Option 4. The last option is a bit more interesting. We could send both sender and receiver out. The reason we added `time.Sleep` is because the program would otherwise exit.

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

Sending and receiving on a channel blocks its Goroutine. If that Goroutine happens to be the `main` Goroutine, the program will cause a fatal error.

#### - You cannot send to a closed channel

When a channel is closed, sending to it would cause the program to panic. General principle of using Go channels is don't close a channel from a receiver and close a channel in a sender.

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

When receiving from a closed channel, there will not be panic. The value returned from a closed channel is the zero value of that type. You can also verify if the channel is closed with `, ok`

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

This is similar to the first point. Once the `main` goroutine exits, all the other goroutines exit as well. You don't have to worry about the unpaired senders or receivers in its goroutine. This would not be the case if either one is in the main goroutine(the one that runs the function main).

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

`range` is commonly used since you do not know how many receivers you typically would need. When using `range`, remember the range will always create one more receiver until its channel is closed.

Running the following example will produce the `deadlock` error. At the third iteration of `range`, it creates another `<-c` and waits for the sender. Since it is in the main goroutine, the program deadlocks.

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

You can solve this in two ways. Using rule number 4 or close the channel. Here is the program using rule number 4. There are two goroutines, sender and receiver. Sender is sending 3 integer data `i` and receiver is receving as many as sender's plus one. This is not causing deadlock is because receiver is only blocking its own goroutine not the main goroutine (rule 4). `time.Sleep` will block the program from exiting.

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

Another option is to `close` the channel. Remember once the channel is closed, you could no longer send data into it.

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
