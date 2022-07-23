module.exports = {
    callback: ({ message, args, text }) => {
        message.reply({
            content: "Pong!"
        })
        console.log(args); console.log(text);
    }
}
