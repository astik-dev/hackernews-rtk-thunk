import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type Story = {
	by: string,
	descendants: number,
	id: number,
	kids: number[],
	score: number,
	time: number,
	title: string,
	type: string,
	url: string,
}

type StoryWithOptionalUrl = Omit<Story, "url"> & Partial<Pick<Story, "url">>;

type StoriesState = {
	ids: Story["id"][],
	entities: Record<Story["id"], Story>,
	loading: boolean,
	error: string | null,
}

const API_BASE_URL = "https://hacker-news.firebaseio.com/v0/";

export const fetchTopStoryIds = createAsyncThunk<
	Story["id"][],
	void,
	{ state: { stories: StoriesState } }
>(
	"stories/fetchTopStoryIds",
	async () => {
		const response = await fetch(API_BASE_URL + "topstories.json");
		if (!response.ok) {
			throw new Error(`Error ${response.status} - ${response.statusText}`);
		};
		return response.json();
	},
	{
		condition: (_, { getState }) => {
			const { loading } = getState().stories;
			if (loading) return false;
		}
	}
);

export const fetchStoriesByIds = createAsyncThunk<
	Story[],
	Story["id"][],
	{ state: { stories: StoriesState } }
>(
	"stories/fetchStoriesByIds",
	async (storyIds) => {
		return Promise.all(
			storyIds.map(async storyId => {
				const response = await fetch(API_BASE_URL + `item/${storyId}.json`);
				if (!response.ok) {
					throw new Error(
						`Error ${response.status} - ${response.statusText}`
					);
				}
				const result: StoryWithOptionalUrl | null = await response.json();
				if (!result) {
					throw new Error(`Story with ID ${storyId} not found`);
				}
				return {
					...result,
					url:
						result.url ||
						`https://news.ycombinator.com/item?id=${result.id}`,
				};
			})
		);
	},
	{
		condition: (storyIds, { getState }) => {
			const { stories } = getState();
			if (stories.loading) return false;
			return !storyIds.every(id => stories.entities[id]);
		}
	}
);

const initialState: StoriesState = {
	ids: [],
	entities: {},
	loading: false,
	error: null,
}

const storiesSlice = createSlice({
	name: "stories",
	initialState,
	reducers: {},
	extraReducers: builder => {

		builder.addCase(fetchTopStoryIds.pending, state => {
			state.loading = true;
		});
		builder.addCase(fetchTopStoryIds.fulfilled, (state, { payload }) => {
			state.loading = false;
			state.ids = payload;
		});
		builder.addCase(fetchTopStoryIds.rejected, (state, { error }) => {
			state.loading = false;
			state.error = error.message ?? "Error!";
		});

		builder.addCase(fetchStoriesByIds.pending, state => {
			state.loading = true;
		});
		builder.addCase(fetchStoriesByIds.fulfilled, (state, { payload }) => {
			state.loading = false;
			payload.forEach(story => state.entities[story.id] = story);
		});
		builder.addCase(fetchStoriesByIds.rejected, (state, { error }) => {
			state.loading = false;
			state.error = error.message ?? "Error!";
		});
	},
});

export default storiesSlice.reducer;
