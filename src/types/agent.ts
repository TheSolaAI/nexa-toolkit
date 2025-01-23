export type Tool = {
    type:string
    description: string;
    name: string;
    parameters:ToolParameters 

}
export type ToolParameters = {
    type:string
    strict:boolean,
    required?: string[];
    properties: ToolProperties
};

export type ToolProperties = {
    [key: string]: {
        type: string;
        description: string;
        }
    }
    


