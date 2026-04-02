import { useEffect, useState, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import {
	fetchStoriesByIds,
	fetchStoryIds,
	STORY_FEED_TYPES,
	type StoryFeedType,
	type Story as StoryType
} from "./redux/storiesSlice";
import Pagination from "./components/Pagination";
import Story from "./components/Story";
import React from "react";

const STORIES_PER_PAGE = 20;

const PAGE_PARAM = "page";
const FEED_PARAM = "feed"; 

function getQueryParam(key: string): string | null {
	const params = new URLSearchParams(window.location.search);
	return params.get(key);
}

function setQueryParam(
	key: string,
	value: string | number,
	shouldPushState: boolean = true
): void {
	const url = new URL(window.location.href);
	url.searchParams.set(key, String(value));
	history[shouldPushState ? "pushState" : "replaceState"]({}, '', url);
}

function isStoryFeedType(value: string | null): value is StoryFeedType {
	return value !== null && STORY_FEED_TYPES.includes(value as StoryFeedType);
}

function calcPageCount(storyCount: number): number {
	return Math.ceil(storyCount / STORIES_PER_PAGE);
}

function getStoryIdsForPage<T>(storyIds: T[], page: number): T[] {
	return storyIds.slice((page - 1) * STORIES_PER_PAGE, STORIES_PER_PAGE * page);
}

function App() {

	const { ids, entities, feedType: currentFeedType, loading, error } =
		useAppSelector(store => store.stories);
	const dispatch = useAppDispatch();

	const [ page, setPage ] = useState(0);

	useEffect(() => {
		const feedParamValue = getQueryParam(FEED_PARAM);
		const feedTypeToFetch =
			isStoryFeedType(feedParamValue) ? feedParamValue : "top";
		setQueryParam(FEED_PARAM, feedTypeToFetch, false);
		dispatch(fetchStoryIds(feedTypeToFetch)).unwrap()
			.then(data => {
				const pageParamValue = Number(getQueryParam(PAGE_PARAM));
				const pageCount = calcPageCount(data.ids.length);

				const initialPage =
					(!pageParamValue || pageParamValue < 0) ? 1 :
					(pageParamValue > pageCount) ? pageCount :
					pageParamValue;

				setQueryParam(PAGE_PARAM, initialPage, false);

				setPage(initialPage);
			})
			.catch(error => {
				if (error.name !== "ConditionError") console.error(error);
			});
	}, [dispatch]);

	useEffect(() => {
		const handlePopState = () => {
			const feedParamValue = getQueryParam(FEED_PARAM);
			if (isStoryFeedType(feedParamValue)) {
				dispatch(fetchStoryIds(feedParamValue));
			}
			setPage(Number(getQueryParam(PAGE_PARAM)));
		};
		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, [dispatch]);

	useEffect(() => {
		if (ids.length && page) {
			dispatch(fetchStoriesByIds(getStoryIdsForPage(ids, page)));
			if (Number(getQueryParam(PAGE_PARAM)) !== page) {
				setQueryParam(PAGE_PARAM, page);
			}
		}
	}, [dispatch, ids, page]);

	function createFeedTypeClickHandler(feedType: StoryFeedType) {
		return (event: React.MouseEvent<HTMLAnchorElement>) => {
			event.preventDefault();
			const firstPage = 1;
			setQueryParam(PAGE_PARAM, firstPage); 	// Setting the page param here is
													// necessary for correct
													// back-button history
			setQueryParam(FEED_PARAM, feedType, false);
			dispatch(fetchStoryIds(feedType));
			setPage(firstPage);
		}
	}

	const storiesForPage = getStoryIdsForPage(ids, page)
		.map((id): StoryType | undefined => entities[id])
		.filter(story => story !== undefined);

	let content: ReactNode;

	if (error) {
		content = <p style={{ color: "red" }}>{error}</p>;
	} else if (loading || storiesForPage.length === 0) {
		content = "Loading...";
	} else {
		content = (
			<div>
				<div style={{ margin: "24px 0" }}>
					{STORY_FEED_TYPES.map((feedType, index) => (
						<React.Fragment key={feedType}>
							{index !== 0 && " | "}
							<a
								href="#"
								onClick={createFeedTypeClickHandler(feedType)}
								style={feedType === currentFeedType
									? { textDecoration: "underline" }
									: {}
								}
							>
								{feedType[0].toUpperCase() + feedType.slice(1)}
							</a>
						</React.Fragment>
					))}
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					{storiesForPage.map((story, storyIndex) => (
						<Story
							key={story.id}
							story={story}
							rank={(page - 1) * STORIES_PER_PAGE + (storyIndex + 1)}	
						/>
					))}
				</div>
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						marginTop: 24
					}}
				>
					<Pagination
						{...{ page, setPage }}
						count={calcPageCount(ids.length)}
					/>
				</div>
			</div>
		);
	}

	return (
		<div style={{ maxWidth: "700px", margin: "0 auto", paddingBottom: 24 }}>
			<h1
				style={{ cursor: loading ? undefined : "pointer" }}
				onClick={loading ? undefined : () => setPage(1)}
			>
				Hacker News
			</h1>
			{content}
		</div>
	);
}

export default App;
