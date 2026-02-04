import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export type Time = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTrackedShow(showId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLastVisit(): Promise<Time | null>;
    getTrackedShows(): Promise<Array<string>>;
    getTrendingMovies(): Promise<Array<[string, string]>>;
    getTrendingTVShows(): Promise<Array<[string, string]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    removeTrackedShow(showId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateLastVisit(): Promise<void>;
    updateTrendingMovies(_movies: Array<[string, string]>): Promise<void>;
    updateTrendingTVShows(_tvShows: Array<[string, string]>): Promise<void>;
}
