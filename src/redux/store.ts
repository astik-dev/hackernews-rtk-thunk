import { configureStore } from "@reduxjs/toolkit";
import storiesSlice from "./storiesSlice";

export const store = configureStore({
	reducer: {
		stories: storiesSlice,
	}
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
