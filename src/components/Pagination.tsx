type PaginationProps = {
	page: number,
	count: number,
	setPage: (newPage: number) => void,
}

function Pagination({ page, count, setPage }: PaginationProps) {
	return (
		<div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
			<button
				style={{ cursor: "pointer" }}
				onClick={() => setPage(page - 1)}
				disabled={page === 1}
			>
				{"<"}
			</button>
			{page}
			<button
				style={{ cursor: "pointer" }}
				onClick={() => setPage(page + 1)}
				disabled={page === count}
			>
				{">"}
			</button>
		</div>
	);
}

export default Pagination;
