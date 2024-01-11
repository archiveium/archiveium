// import { vitest } from 'vitest';

export class MockCookie {
    private cookieData;

    constructor(cookieData = {}) {
        this.cookieData = cookieData;
    }

    set(key: string) {
        // Do nothing
    }

    get(key: string) {
        return '';
    }

    getAll() {
        return [];
    }

    delete(key: string) {
        // return '';
    }    

    serialize () {
        return '';
    }
}