import fs from 'fs';
import db from '../services/db.js';

const BASE_URL = 'https://bluesky.mgcounts.com';
const SITEMAP_DIR = './sitemaps';
const MAX_URLS_PER_FILE = 100000;
const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>\n';

const createDirectories = () => {
    const subDirs = ['', '/users', '/compare'];
    subDirs.forEach(dir => {
        const path = `${SITEMAP_DIR}${dir}`;
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
    });

    const initialFiles = ['/compare.xml', '/users.xml'];
    initialFiles.forEach(file => {
        const path = `${SITEMAP_DIR}${file}`;
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, '');
        }
    });
};

const generateXMLFiles = (prefix, urlGenerator, maxUrlsPerFile = MAX_URLS_PER_FILE) => {
    const xmlFiles = [];
    let currentBatch = [];
    let fileIndex = 0;

    for (const url of urlGenerator) {
        currentBatch.push(url);
        if (currentBatch.length === maxUrlsPerFile) {
            const fileName = `${SITEMAP_DIR}/${prefix}/${fileIndex}.xml`;
            generateSitemap(fileName, currentBatch);
            xmlFiles.push(`${BASE_URL}/sitemaps/${prefix}/${fileIndex}.xml`);
            currentBatch = [];
            fileIndex++;
        }
    }

    if (currentBatch.length > 0) {
        const fileName = `${SITEMAP_DIR}/${prefix}/${fileIndex}.xml`;
        generateSitemap(fileName, currentBatch);
        xmlFiles.push(`${BASE_URL}/sitemaps/${prefix}/${fileIndex}.xml`);
    }

    return xmlFiles;
};

const generateSitemap = (filename, urls) => {
    try {
        const urlset = urls.map(url => `
    <url>
        <loc>https://bluesky.mgcounts.com/user/${url}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
        <lastmod>${new Date().toISOString()}</lastmod>
    </url>`).join('\n');

        const sitemapContent = `${XML_HEADER}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>`;
        fs.writeFileSync(filename, sitemapContent);
        console.log(`Generated ${filename}`);
    } catch (error) {
        console.error(`Error generating sitemap for ${filename}:`, error);
    }
};

const generateXMLIndex = (filename, xmlFiles) => {
    try {
        const sitemapIndex = xmlFiles.map(url => `
    <sitemap>
        <loc>${url}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`).join('\n');

        const indexContent = `${XML_HEADER}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapIndex}\n</sitemapindex>`;
        fs.writeFileSync(filename, indexContent);
        console.log(`Generated ${filename}`);
    } catch (error) {
        console.error(`Error generating XML index for ${filename}:`, error);
    }
};

const siteMapGenerator = async () => {
    try {
        const userList = await db.keys();
        if (!userList || userList.length === 0) {
            console.warn('No users found in the database.');
            return;
        }

        createDirectories();

        const userXmlFiles = generateXMLFiles('users', userList);
        generateXMLIndex(`${SITEMAP_DIR}/users.xml`, userXmlFiles);

    } catch (error) {
        console.error('Error generating sitemaps:', error);
    }
};

export default siteMapGenerator;