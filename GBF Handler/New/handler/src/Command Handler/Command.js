class Command {
    constructor(instance, commandName, commandObject) {
        this._instance = instance;
        this._commandName = commandName.toLowerCase();
        this._commandObject = commandObject;
    }

    get commandName() {
        return this._commandName;
    }

    get commandObject() {
        return this._commandObject;
    }

    get instance() {
        return this._instance;
    }

}

module.exports = Command;
