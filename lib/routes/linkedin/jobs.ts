import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { parseJobSearch, KEYWORDS_QUERY_KEY, JOB_TYPES, JOB_TYPES_QUERY_KEY, EXP_LEVELS_QUERY_KEY, parseParamsToSearchParams, EXP_LEVELS, parseParamsToString } from './utils';

const BASE_URL = 'https://www.linkedin.com/';
const JOB_SEARCH_PATH = '/jobs-guest/jobs/api/seeMoreJobPostings/search';

export const route: Route = {
    path: '/jobs/:job_types/:exp_levels/:keywords?',
    categories: ['other'],
    example: '/linkedin/jobs/C-P/1/software engineer',
    parameters: { job_types: "See the following table for details, use '-' as delimiter", exp_levels: "See the following table for details, use '-' as delimiter", keywords: 'keywords' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Jobs',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const jobTypesParam = parseParamsToSearchParams(ctx.req.param('job_types'), JOB_TYPES);
    const expLevelsParam = parseParamsToSearchParams(ctx.req.param('exp_levels'), EXP_LEVELS);

    let url = new URL(JOB_SEARCH_PATH, BASE_URL);
    url.searchParams.append(KEYWORDS_QUERY_KEY, ctx.req.param('keywords') || '');
    url.searchParams.append(JOB_TYPES_QUERY_KEY, jobTypesParam); // see JOB_TYPES in utils.js
    url.searchParams.append(EXP_LEVELS_QUERY_KEY, expLevelsParam); // see EXPERIENCE_LEVELS in utils.js
    url = url.toString();

    // Parse job search page
    const response = await got({
        method: 'get',
        url,
    });
    const jobs = parseJobSearch(response.data);

    const jobTypes = parseParamsToString(ctx.req.param('job_types'), JOB_TYPES);
    const expLevels = parseParamsToString(ctx.req.param('exp_levels'), EXP_LEVELS);
    const feedTitle = 'LinkedIn Job Listing' + (jobTypes ? ` | Job Types: ${jobTypes}` : '') + (expLevels ? ` | Experience Levels: ${expLevels}` : '') + (ctx.req.param('keywords') ? ` | Keywords: ${ctx.req.param('keywords')}` : '');
    return {
        title: feedTitle,
        link: url,
        description: 'This feed gets LinkedIn job posts',
        item: jobs.map((job) => {
            const title = `${job.company} is hiring ${job.title}`;
            const description = `Title: ${job.title} | Company: ${job.company} | Location: ${job.location} `;

            return {
                title, // item title
                description, // job description
                pubDate: parseDate(job.pubDate), // data publish date
                link: job.link, // job source link
            };
        }),
    };
}
