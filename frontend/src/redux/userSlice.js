import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData : null,
        loading: true // to check whether the user data is being fetched or not, to avoid rendering the components before getting user data chatgpt
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
            state.loading = false; // set loading to false after getting user data chatgpt
        }
    }
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;