import { Route } from '@/types';
import getContent from '../utils/common';

export const route: Route = {
    path: '/gfxy/:category?/:page?',
    categories: ['forecast'],
    example: '/hunau/gfxy',
    parameters: { category: '页面分类，默认为 `tzgg`', page: '页码，默认为 `1`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['xky.hunau.edu.cn/', 'xky.hunau.edu.cntzgg_8472', 'xky.hunau.edu.cn/:category'],
        target: '/:category',
    },
    name: '公共管理与法学学院',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    await getContent(ctx, {
        baseHost: 'https://gfxy.hunau.edu.cn',
        baseCategory: 'tzgg', // 默认：通知公告
        baseTitle: '公共管理与法学学院',
        baseDescription: '湖南农业大学公共管理与法学学院',
        baseDeparment: 'gfxy',
    });
}
