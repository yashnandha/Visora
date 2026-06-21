import { createAction, createSlice } from "@reduxjs/toolkit";

export const clearAction = createAction("clear");
const initialState: UserReducerState = {
  userData: undefined,
  isLogin: false,
  token: "",
};

const UserData = createSlice({
  name: "user-data",
  initialState,
  reducers: {
    setUserData(state, action) {
      state.userData = action.payload;
      state.isLogin = true;
    },
    setToken(state, action) {
      state.token = action.payload;
      state.isLogin = true;
    },
  },
});

export const { setToken, setUserData } =
  UserData.actions;

export default UserData.reducer;
