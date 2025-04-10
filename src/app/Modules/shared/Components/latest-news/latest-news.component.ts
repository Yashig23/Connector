import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../Services/news.service'


interface news{
    title: string,
    link: string
}

@Component({
  selector: 'app-latest-news',
  templateUrl: './latest-news.component.html',
  styleUrl: './latest-news.component.scss'
})
export class LatestNewsComponent implements OnInit{
  newsList: any[] = [];

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    this.newsService.getLatestNews().subscribe(response => {
      this.newsList = response.results.map((news: news) => ({
        title: news.title,
        link: news.link
      }));
    }, error => {
      console.error('Error fetching news:', error);
    });
  }

}
