export namespace AuthTypes {
    export interface login {
        username: string;
        password: string;
        token?: string; // Optional token for authenticated requests
    }

    export interface logout {
        message: string;
    }

    export interface register {
        username: string;
        password: string;
        email?: string; // Optional email for registration
    }
}