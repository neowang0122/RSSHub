import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yjsy/zhaosheng/:id?',
    categories: ['forecast'],
    example: '/sdust/yjsy/zhaosheng',
    parameters: { id: '栏目 id，见下表，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生招生网',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'tzgg';

    const rootUrl = 'https://yjsy.sdust.edu.cn';
    const currentUrl = `${rootUrl}/zhaosheng/${id}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.pageUl ul li a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.attr('title'),
                link: new URL(item.attr('href'), currentUrl).href,
                pubDate: parseDate(item.find('span').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.txt, .v_news_content').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
