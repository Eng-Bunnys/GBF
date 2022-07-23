class Command {
    constructor(commandName, commandObject) {
        this._commandName = commandName.toLowerCase();
        this._commandObject = commandObject;
        this.verifySyntax();
    }

    verifySyntax() {}

    get commandName() {
        return this._commandName;
    }

    get commandObject() {
        return this._commandObject;
    }

}

module.exports = Command;
