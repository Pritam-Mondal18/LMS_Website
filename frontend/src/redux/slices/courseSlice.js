import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { category, search, page = 1, limit = 10 } = filters;
      let queryParams = new URLSearchParams({ page, limit });
      
      if (category && category !== 'all') queryParams.append('category', category);
      if (search) queryParams.append('search', search);

      const response = await api.get(`/courses?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
    }
  }
);

export const fetchCourseDetail = createAsyncThunk(
  'courses/fetchDetail',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/courses/${slug}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course details');
    }
  }
);

const initialState = {
  courses: [],
  featuredCourses: [],
  currentCourse: null,
  loading: false,
  detailLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCourseError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses || [];
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.page || 1;
        // Seed featured courses from published and featured ones
        state.featuredCourses = (action.payload.courses || []).filter(c => c.isFeatured);
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Course Detail
      .addCase(fetchCourseDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
        state.currentCourse = null;
      })
      .addCase(fetchCourseDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentCourse = action.payload.course ? {
          ...action.payload.course,
          isEnrolled: action.payload.isEnrolled
        } : null;
      })
      .addCase(fetchCourseDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCourseError } = courseSlice.actions;
export default courseSlice.reducer;
