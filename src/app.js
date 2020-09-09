Vue.component('post-item', {
	props: [ 'image_data' ],
	template: `
  <div class="mb-4 rounded-lg image-item relative" @click="$emit('copy-to-clipboard', image_data.images.original.url )">
    <img 
      class="rounded-lg shadow border border-gray-400 z-50"
      :src="image_data.images.fixed_width_downsampled.url" 
      :width="image_data.images.fixed_width_downsampled.width" 
      :height="image_data.images.fixed_width_downsampled.height" 
    />
    <i class="far fa-image absolute text-4xl text-gray-600" style="top:50%; left:50%; z-index: -1; transform:translate(-50%, -50%)"></i>
    <div class="image-over rounded-lg flex items-center justify-center">
      <i class="fas fa-link text-white text-xl"></i>
    </div>
  </div>
`
});

new Vue({
	el: '#app',
	data: {
		searchInput: '',
		posts: [],
		loading: false,
		copied: false,
		offset: 0,
		limit: 24,
		totalCount: 0,
		lastPage: false
	},
	methods: {
		async fetchContent() {
			this.loading = true;
			const res = await axios(
				`https://api.giphy.com/v1/gifs/search?q=${this
					.searchInput}&api_key=l7ZYtBaDl70yLw0hOZAh5ClMNyP0VSrY&limit=${this
					.limit}&rating=pg-13&offset=${this.offset}`
			);
			const [ ...content ] = res.data.data;
			this.loading = false;
			this.totalCount = res.data.pagination.total_count;
			const current_post_ids = this.posts.map((post) => post.id);
			this.posts.push(
				...content.filter((post) => !current_post_ids.includes(post.id))
			);
		},
		copyToClipboard(str) {
			this.copied = true;
			const el = document.createElement('textarea');
			el.value = str;
			document.body.appendChild(el);
			el.select();
			document.execCommand('copy');
			document.body.removeChild(el);
			setTimeout(() => {
				this.copied = false;
			}, 1000);
		},
		newSearch() {
			this.offset = 0;
			this.posts = [];
			this.fetchContent();
		},
		isClear() {
			if (this.searchInput === '') {
				this.posts = [];
			}
		}
	},
	mounted() {
		const options = {
			root: null,
			rootMargin: '0px',
			threshold: 0
		};
		const callback = (entries) => {
			if (this.posts.length) {
				this.offset += this.limit;
				this.fetchContent();
			}
		};
		let observer = new IntersectionObserver(callback, options);
		let target = document.getElementById('observable-target');
		observer.observe(target);
	},

	computed: {
		buttonText() {
			if (this.loading) {
				return '...';
			} else {
				return 'Find';
			}
		}
	}
});
