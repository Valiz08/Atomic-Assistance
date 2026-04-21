export namespace AuthTypes {
    export interface login {
        id?: string;
        username: string;
        password: string;
        token?: string; 
    }

    export interface logout {
        message: string;
    }

    export interface register {
        username: string;
        password: string;
        email?: string;
    }
}