import { Route } from '@/types';
import { rootUrl, getList, getItems } from './utils';

export const route: Route = {
    path: '/essay',
    categories: ['finance'],
    example: '/caareviews/essay',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['caareviews.org/reviews/essay'],
    },
    name: 'Essays',
    maintainers: ['Fatpandac'],
    handler,
};

async function handler(ctx) {
    const url = `${rootUrl}/reviews/essay`;

    const list = await getList(url);
    const items = await getItems(ctx, list);

    return {
        title: 'Essays',
        link: url,
        item: items,
    };
}
