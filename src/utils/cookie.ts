import Cookies from "js-cookie"

export const TOKEN_COOKIE_KEY = "token"

export const sessionToken = {
    get() {
        return Cookies.get(TOKEN_COOKIE_KEY)
    },
    set(token: string) {
        Cookies.set(TOKEN_COOKIE_KEY, token, { expires: 100, path: "/" })
    },
    remove() {
        Cookies.remove(TOKEN_COOKIE_KEY)
    }
}