export default interface Database{
    set(id: string, value: any): Promise<void>;
    get(id: string): Promise<any>;
    exists(id: string): Promise<boolean>;
    save(): Promise<void>;
}