import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Story as StoryType } from "../redux/storiesSlice";

dayjs.extend(relativeTime);

const BASE_URL = "https://news.ycombinator.com/";

type StoryProps = {
	story: StoryType,
	rank: number,
}

function Story({ story, rank }: StoryProps) {

	const commentsUrl = `${BASE_URL}item?id=${story.id}`;
	const userUrl = `${BASE_URL}user?id=${story.by}`;

	const hostname =
		new URL(story.url || commentsUrl).hostname.replace(/^www\./, "");

	const fromSiteUrl = `${BASE_URL}from?site=${hostname}`;

	return (
		<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
			<img
				src={`https://icons.duckduckgo.com/ip3/${hostname}.ico`}
				alt="favicon"
				style={{ width: "1.4rem", height: "1.4rem", aspectRatio: "1 / 1" }}
			/>
			<div>
				<div>
					<a href={story.url || commentsUrl} target="_blank">
						{rank + ". " + story.title}
					</a>
					{" "}
					<span style={{ fontSize: "0.8em", color: "grey" }}>
						(<a href={fromSiteUrl} target="_blank">{hostname}</a>)
					</span>
				</div>
				<div style={{ marginTop: 2, fontSize: "0.8em", color: "grey" }}>
					{story.score} points
					by <a href={userUrl} target="_blank">{story.by}</a>
					{" " + dayjs(story.time * 1000).fromNow()}
					{story.descendants !== undefined && (
						<>
							{" | "}
							<a
								href={commentsUrl}
								target="_blank"
								style={{ whiteSpace: "nowrap" }}
							>
								{story.descendants} comments
							</a>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default Story;
