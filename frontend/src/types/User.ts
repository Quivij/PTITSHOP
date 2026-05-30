export interface User {
    _id: string;
    fullName: string;
    phoneNumber: string;
    gender: boolean;
    dateOfBirth: string;
    avt: string;
    email: string;
    username: string;
    isActive: boolean;
    isAdmin: boolean;
    __v: number;

    favProducts: string[],
    viewedProducts: string[]
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
}

export interface ProfileResponse {
    success: boolean;
    message?: string;
    data: User;
}
