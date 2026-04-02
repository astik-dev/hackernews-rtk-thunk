import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const STORY_FEED_TYPES = [ "top" , "best" , "new" ] as const;

export type StoryFeedType = (typeof STORY_FEED_TYPES)[number];

export type Story = {
	by: string,
	id: number,
	score: number,
	time: number,
	title: string,
	type: string,
	url?: string,
	descendants?: number,
	kids?: number[],
}

type StoriesState = {
	ids: Story["id"][],
	entities: Record<Story["id"], Story>,
	feedType: StoryFeedType | null,
	loading: boolean,
	error: string | null,
}

const API_BASE_URL = "https://hacker-news.firebaseio.com/v0/";

export const fetchStoryIds = createAsyncThunk<
	{ ids: Story["id"][], feedType: StoryFeedType },
	StoryFeedType,
	{ state: { stories: StoriesState } }
>(
	"stories/fetchTopStoryIds",
	async (feedType) => {
		const response = await fetch(API_BASE_URL + feedType + "stories.json");
		if (!response.ok) {
			throw new Error(`Error ${response.status} - ${response.statusText}`);
		};
		const ids: Story["id"][] = await response.json();
		return { ids, feedType };
	},
	{
		condition: (feedType, { getState }) => {
			const { loading, feedType: currentFeedType } = getState().stories;
			if (loading || currentFeedType === feedType) return false;
		}
	}
);

export const fetchStoriesByIds = createAsyncThunk<
	Story[],
	Story["id"][],
	{ state: { stories: StoriesState } }
>(
	"stories/fetchStoriesByIds",
	async (storyIds, { getState }) => {
		const { stories } = getState();
		return Promise.all(
			storyIds.filter(id => !stories.entities[id]).map(async storyId => {
				const response = await fetch(API_BASE_URL + `item/${storyId}.json`);
				if (!response.ok) {
					throw new Error(
						`Error ${response.status} - ${response.statusText}`
					);
				}
				const result = await response.json();
				if (!result) {
					throw new Error(`Story with ID ${storyId} not found`);
				}
				return result;
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
	feedType: null,
	loading: false,
	error: null,
}

const storiesSlice = createSlice({
	name: "stories",
	initialState,
	reducers: {},
	extraReducers: builder => {

		builder.addCase(fetchStoryIds.pending, state => {
			state.loading = true;
		});
		builder.addCase(fetchStoryIds.fulfilled, (state, { payload }) => {
			state.loading = false;
			state.ids = payload.ids;
			state.feedType = payload.feedType;
		});
		builder.addCase(fetchStoryIds.rejected, (state, { error }) => {
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
