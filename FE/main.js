const clientIo = io("http://localhost:3000",{
    auth:{
        authorization:`bearer ${localStorage.getItem("authorization")}`
    }
})
clientIo.emit("hi","Hello from FE",{id:localStorage.getItem("socketid")})
// clientIo.on("Reply",(data)=>{
    // console.log(data)
// })
clientIo.on("connect_error",(error)=>{
    Socket.emit("app_error",{message:error.message})
})