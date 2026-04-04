import { createSlice } from "@reduxjs/toolkit";

const courseSlice = createSlice({
    name: "course",
    initialState: {
        creatorCourseData:[], // to store the course data created by the creator to show in courses page
        loading: true // to check whether the creator course data is being fetched or not, to avoid rendering the components before getting creator course data
    },
    reducers: {
        setCreatorCourseData: (state, action) => {
            state.creatorCourseData = action.payload;
            state.loading = false;
        }
    }
});

export const { setCreatorCourseData } = courseSlice.actions;
export default courseSlice.reducer;