import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import parser from '@/utils/rss-parser';
import { load } from 'cheerio';

export const route: Route = {
    path: '/myft/:key',
    categories: ['bbs'],
    example: '/ft/myft/rss-key',
    parameters: { key: 'the last part of myFT personal RSS address' },
    features: {
        requireConfig: true,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'myFT personal RSS',
    maintainers: ['HenryQW'],
    handler,
};

async function handler(ctx) {
    const ProcessFeed = (content) => {
        // clean up the article
        content.find('div.o-share, aside, div.o-ads').remove();

        return content.html();
    };

    const link = `https://www.ft.com/myft/following/${ctx.req.param('key')}.rss`;

    const feed = await parser.parseURL(link);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                    headers: {
                        Referer: 'https://www.facebook.com',
                    },
                });

                const $ = load(response.data);

                item.description = ProcessFeed($('article.js-article__content-body'));
                item.category = [
                    $('.n-content-tag--with-follow').text(),
                    ...$('.article__right-bottom a.concept-list__concept')
                        .map((i, e) => $(e).text().trim())
                        .get(),
                ];
                item.author = $('a.n-content-tag--author')
                    .map((i, e) => ({ name: $(e).text() }))
                    .get();

                return item;
            })
        )
    );

    return {
        title: `FT.com - myFT`,
        link,
        description: `FT.com - myFT`,
        item: items,
    };
}
