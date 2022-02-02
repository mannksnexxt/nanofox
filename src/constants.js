export const FILE_ICONS = {
	text: ['txt', 'md', 'docx', 'json'],
	image: ['jpg', 'jpeg', 'png', 'svg', 'ico'],
	code: ['js', 'css', 'html', 'php', 'py', 'twig', 'vue', 'scss', 'go']
}

export const FILE_TYPES = {
	1: 'FILE',
	2: 'DIR'
}

export function deepSearch(source, dir) {
	if (source) {
		const searched_dir = source.find(file => file.name === dir);
		if (searched_dir && searched_dir.nested_files) {
			return searched_dir.nested_files;
		}
		return 'unseen';
	}
	return false;
}
