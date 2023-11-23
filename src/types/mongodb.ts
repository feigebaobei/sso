import type { N, S, B, O, A, ULID } from './base'

interface UserDocument {
    name: S
    email: S
    id: ULID
    passowrd_hash: S
    systems: {
        id: N
        role_list: N[]
        ruter_list: N[]
    }[]
}
export type {
    UserDocument,

}