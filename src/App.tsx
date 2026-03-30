import { useEffect, useState, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import {
	fetchStoriesByIds,
	fetchTopStoryIds,
	type Story as StoryType
} from "./redux/storiesSlice";
import Pagination from "./components/Pagination";
import Story from "./components/Story";

const STORIES_PER_PAGE = 10;
const PAGE_PARAM = "page";

function getPageParamValue(): number {
	const params = new URLSearchParams(window.location.search);
	return Number(params.get(PAGE_PARAM));
}

function calcPageCount(storyCount: number): number {
	return Math.ceil(storyCount / STORIES_PER_PAGE);
}

function getStoryIdsForPage<T>(storyIds: T[], page: number): T[] {
	return storyIds.slice((page - 1) * STORIES_PER_PAGE, STORIES_PER_PAGE * page);
}

function App() {

	const { ids, entities, loading, error } = useAppSelector(store => store.stories);
	const dispatch = useAppDispatch();

	const [ page, setPage ] = useState(0);

	useEffect(() => {
		dispatch(fetchTopStoryIds()).unwrap()
			.then(storyIds => {
				const pageParamValue = getPageParamValue();
				const pageCount = calcPageCount(storyIds.length);

				const initialPage =
					(!pageParamValue || pageParamValue < 0) ? 1 :
					(pageParamValue > pageCount) ? pageCount :
					pageParamValue;

				window.history.replaceState({}, "", `?${PAGE_PARAM}=${initialPage}`);

				setPage(initialPage);
			})
			.catch(error => {
				if (error.name !== "ConditionError") console.error(error);
			});
	}, [dispatch]);

	useEffect(() => {
		const handlePopState = () => setPage(getPageParamValue());
		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, []);

	useEffect(() => {
		if (ids.length && page) {
			dispatch(fetchStoriesByIds(getStoryIdsForPage(ids, page)));
			const newQuery = `?${PAGE_PARAM}=${page}`;
			if (window.location.search !== newQuery) {
				window.history.pushState({}, "", newQuery);
			}
		}
	}, [dispatch, ids, page]);

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
		<div style={{ maxWidth: "700px", margin: "0 auto" }}>
			<h1>Hacker News</h1>
			{content}
		</div>
	);
}

export default App;
