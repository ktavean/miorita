/* eslint-disable no-param-reassign,no-shadow */
import { ActionContext } from "vuex/types/index.d";

interface AppState {
    code: string
}

export function state ():AppState {
    return {
        code: "",
    };
}

export const mutations = {
    setCode (state:AppState, value:string) {
        state.code = value;
    },
};

type StoreContext = ActionContext<AppState, {}>;

export const actions = {
    init ({ commit }:StoreContext) {
        commit("setCode", localStorage.workCode || "");
    },

    setCode ({ commit } : StoreContext, value:string) {
        localStorage.workCode = value;
        commit("setCode", value);
    },
};
