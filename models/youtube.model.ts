
export interface YoutubeVideoItemsSnippetThumbail {
  url: string;
  width: number;
  height: number;
}

export interface YoutubeVideoItemsSnippet {
  category: string;
  channelId: string;
  channelTitle: string;
  description: string;
  tags: string[];
  title: string;
  thumbnails: { [key: string] : YoutubeVideoItemsSnippetThumbail}
}

export interface YoutubeVideoItemsStatistic {
  commentCount: string;
  dislikeCount: string;
  favoriteCount: string;
  likeCount: string;
  viewCount: string;
}

export interface YoutubeVideoItems {
  etag: string;
  id: string;
  kind: string;
  snippet: YoutubeVideoItemsSnippet;
  statistics: YoutubeVideoItemsStatistic;
}

export interface YoutubeVideosResponse {
  etag: string;
  items: YoutubeVideoItems[];
  kind: string;
  pageInfo: { totalResults: number, resultsPerPage: number };

}
