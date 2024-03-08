import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/today/:language?',
    categories: ['traditional-media'],
    example: '/kbs/today',
    parameters: { language: 'Language, see below, e as English by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['world.kbs.co.kr/'],
        target: '/today',
    },
    name: 'Today',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? 'e';

    const rootUrl = 'http://world.kbs.co.kr';
    const currentUrl = `${rootUrl}/service/news_today.htm?lang=${language}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.comp_text_1x article')
        .map((_, item) => {
            item = $(item);

            const a = item.find('h2 a');

            return {
                title: a.text(),
                category: item.find('.cate').text(),
                link: `${rootUrl}/service${a.attr('href').replace('./', '/')}`,
                pubDate: timezone(parseDate(item.find('.date').text()), +9),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.body_txt').html();

                return item;
            })
        )
    );

    return {
        title: `Latest News | KBS WORLD`,
        link: currentUrl,
        item: items,
    };
}
