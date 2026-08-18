const clientIo = io("http://localhost:3000", {
    auth: {
        authorization: `bearer ${localStorage.getItem("authorization")}`,
        socketid: localStorage.getItem("socketid")
    }
});

clientIo.emit("hi", "Hello from FE", { id: localStorage.getItem("socketid") });

clientIo.on("connect_error", (error) => {
    clientIo.emit("app_error", { message: error.message });
});