import fs from "fs"
import path from "path"
import Database from "./Database.js"

//note: although the database interface assumes async, this implementation is synchronously cus it's easier
export class JsonDatabase implements Database{
  private readonly filename: string;
  private initialized: boolean = false;
  private data!: Record<string, any>;

  constructor(filename: string){
    this.filename = filename;
  }

  private loadDatabase(): void {
    if(this.initialized) throw new Error("attempted to intialize database twice");
    
    else try{
      this.data = JSON.parse((fs.readFileSync(this.filename, "utf-8")));
    } catch{
      this.data = {};
    }

    this.initialized = true;
  }

  async get(id: string): Promise<any> {
    if(!this.initialized) this.loadDatabase();
    return this.data[id];
  }

  async set(id: string, value: any): Promise<void> {
    if(!this.initialized) this.loadDatabase();
    this.data[id] = value;
  }

  async exists(id: string): Promise<boolean> {
    if(!this.initialized) this.loadDatabase();
    return this.data[id] !== undefined;
  }

  async save(): Promise<void> {
    if(!this.initialized) this.loadDatabase();
    fs.mkdirSync(path.dirname(this.filename), {recursive: true});
    fs.writeFileSync(this.filename, JSON.stringify(this.data));
  }
}
