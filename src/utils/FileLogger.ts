import Logger from "./Logger";
import * as fs from "fs/promises";
import {join} from "path";

export default class FileLogger extends Logger {
    
    private _logFile: fs.FileHandle;

    constructor(
        name: string,
        datetime: boolean,
    ) {
        super(name, datetime);
        this.init();
    }

    private async init() {
        this._logFile = await fs.open(join(process.cwd(), "logs", `${name}.log`), "w");
    }

    public log(...args: any[]) {
        super.log(...args);
        this.logFile(LogType.Log, ...args);
    }

    public error(...args: any[]) {
        super.log(...args);
        this.logFile(LogType.Error, ...args);
    }

    private logFile(type: LogType, ...args: any[]) {
        const lines = args.join(" ").split("\n");
        for (const line of lines)
            this._logFile.write(`\r\n${type} ${this.getTime()} ${line}`);
    }
}
enum LogType {
    Error = "ERR",
    Log = "LOG",
}