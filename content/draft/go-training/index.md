---
title: Go Training
date: '2020-11-11T22:12:03.284Z'
draft: false
tags: ["coding"]
ogimage: './docker-go.png'
---

## Project set up

1. A project is a repo
2. every single project/repo, gets to define the policy for that codebase
    - policy are guidlines
    - every project gets to set up the policy
    - everyone in the same team should follow the same guidelines
3. app, business, fundation, maximum 5 layers
    - app -> start/shutdown, presentation layer (routes)
    - fundation could be a kit project, company standard lib
    - business import only from business and fundation
    - app import anywhere
    - minimize imports
4. module and project and repo is the same
5. what is the purpose of the logs, logs are critically important to logs
    - data in metrics, not in logs
    - if data need structure logger
    - filter the noise out during development, no logging level, either you need or you dont
    - define the logger and pass it around to the application
6. start up and shut down
7. how to handle configs
    - no one is allowed to touch config
    - read config at one source, and pass it around
    - must have working defaults, have default work in development. 
    - able to overwrite defaults, operator should able to use flags
    - you can set a package build variable, and run a go command to change it dynamically
        - initialize variable do
        - order intialization variable does not matter
        - the only source code is allow to use the config file, is the file 
    - stay away from using files
    >Package level variable vs environment variables in a `.env` file
    - go mod tidy, go mod vendor to install
8. memory, cpu usages
9. load shedding with server shut down, it needs to stop taking new request, but finish old requests
    - ReadTimeout, a bit un-reasonable to start, but eventually we can figure it out
    - write to-dos in main.go
    - verify server can shut down, before, during, and after requests
    - use a delayed
10. package oritented design
    - a static package that is built that is linked together
    - basic unit of code in go
    - every folder represents a different binary, unlike Node monolith
    - every package must have a purpose that is clear and an API helps to implement that purpose
    - a type system allow data to flow in and out of the package
    - no API should return anything but concrete data, no interface type as returns
    - it is ok to have multiple packages with same types
    - what job does it do?
    - marshalling is ok, between packages, keep the boundary clean and clear
    - start with large packages, and make sure unit of code stands by itself
    - every package needs to have a file named itself
    - package must provide not contains
11. Comments are codes, comments are meant to be read
    - comments use regular grammer
    - all comments inside need to have a line feed above comments
12. what mux to use
13. ability to internally signal shut down to handle corrupted data
14. without nps, when import it bring the latest version of `/v1` 
15. handlers - we need a way to handle logs, metrics and etc, and put all of them in one foundation would be ideal
16. fundation package
    - no loggers
    - no shutdowns but u can signal a shut down by business code
    - if return package name, just use New for a function, otherwise name NewApp
17. web fondation
    - start a mux
    - a function to trigger shutdown
18. For things not being able to check at compile time, we pass a context as a first param into handler functions. And add a return of error for handler functions
    - once error is returned, we can add a foundation to handle errors
19. 0 -> many, use ...Middleware
20. use doc.go for documentation
21. start and completed logger very important
21. if context try to pull state, and isn't there. shut down the service
22. what does it mean to handle an error?
    - log the error only once
    - error stops there, never propgated 
    - must make a decision to keep the application running
23. Errors are just values, they can be anything you want to be.
24. Trusted errors vs untrusted errors
    - for untrusted errors, give error 500, and that's it
    - for trusted errors, give context of the error
25. when to use factory function?
    - one line of code?
    - precision and readability
26. do not want to just send errors, return error only, ok they can process. 
    - middleware process errors
    - handlers just return errors errors.new
27. panics
    - the go rountine needs to know how to panic
    - build in function recorver() only works in defer
    - debug.Stack() show stack trace
28. named returns, like (err error). Only use it in defer, and assign. 
29. metrics should be in a middle ware
30. Leo, the reason we wrap each into two functions, becaus we need closure for the logs, that's why we doing that for metrics only for consistency.
31. package level variable ok or not?
    - check on the constrains. :37 mins -ish for day 3
32. hey -m GET -c 100 -n 1000000 "server address", verify controlled shutdown
Day3
33. token needs to know Key id for each token, in case there are mutliple public keys
34. try not to partial constructed struct, create local variables, then construct the struct in one go
35. unit test use `auth_test`, go test ./... -count=1
    - count=1 by pass the cache 
    - cd into the file then run test
36. private key use to generate token, and public key to verify
37. kubernates
    - cluster of one or many pods, a pod is servering one of our services
    - each pod can have the service, metrics and etc
    - 
Day4
1. CGO_ENABLED removed
2. ARG VCS_REF -> build variables and etc
3. add `.dockerignore` ignore what is not needed
4. you can choose to copy over vendor folder or not, if no vendor folder, `RUN go mode download`
5. docker image prune
6. only need to load local image, but postgres does not need since it can be found in the hub
7. matchlabel will query pods with that name
Break1
1. add livness
2. probe we dont want to bind it to app mux, we want to bind it to debug mux
3. delete a pod and auto restart
4. expvar -var="build"
Break2
1. sqlx
2. Open database
3. ping database does not all work
4. 
Break 3
1. Decode and validate
2. pass traceID, and now timer, id generated by us. if not prebuild id and time, we have to query DB again. own it at the caller level
3. 

Day 4:

1. do logging, ExecContext
2. go test -v, go test -cover, go test -coverprofile p.out, go tool cover -html p.out
3. we are using docker for testin, stop container and rm its volumne
4. 


1. we are drafting, drafting, drafting, only publish when the team agrees
    - are they named correctly
    - can it be tested
    - are they in the right place
    - write code for the next person
