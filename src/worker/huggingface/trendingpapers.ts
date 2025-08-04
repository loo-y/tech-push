const BASE_URL = "https://huggingface.co/papers/trending";
interface Paper {
  title: string;
  url: string;
  abstract: string;
  github_url: string;
  arxiv_url: string;
  date_published: string | null;
  author: string;
  upvotes: number;
}
export class HuggingFaceScraper {
  async fetchPapers(c: any): Promise<Paper[]> {
    const res = await fetch(BASE_URL);
    let papers: Paper[] = [];
    let tempPaper: Partial<Paper> = {};
    await new HTMLRewriter()
      .on('article', {
        element(element) {
          console.log(`element`, element);
        }
      })
      .on('article div:first-child div:nth-child(2) h3 a', {
        text(text) {
          if(text.text) {
            // console.log(`title`, text.text);
            const result = setTempPaper({
              tempPaper,
              papers,
              paperItem: { title: text.text }
            });
            // console.log(`result`, result);
            tempPaper = result.tempPaper;
            papers = result.papers;
          }
        },
        element(element) {
          const href = element.getAttribute("href");
          // console.log(`url`, href);
          const result = setTempPaper({
            tempPaper,
            papers,
            paperItem: { url: href ? `https://huggingface.co${href}` : "" }
          });
          // console.log(`result`, result);
          tempPaper = result.tempPaper;
          papers = result.papers;
        }
      })
      .on('article div:first-child div:nth-child(2) p', {
        text(text) {
          if(text.text) {
            // console.log(`abstract`, text.text);
            const result = setTempPaper({
              tempPaper,
              papers,
              paperItem: { abstract: text.text }
            });
            // console.log(`result`, result);
            tempPaper = result.tempPaper;
            papers = result.papers;
          }
        }
      })
      .on('article div:first-child div:nth-child(3) a:first-child div div', {
        text(text) {
          if(text.text) {
            const result = setTempPaper({
              tempPaper,
              papers,
              paperItem: { upvotes: parseInt(text.text) }
            });
            // console.log(`result`, result);
            tempPaper = result.tempPaper;
            papers = result.papers;
          }
        }
      })
      .on('article div:first-child div:nth-child(3) > a:nth-child(2)', {
        element(element) {
          const href = element.getAttribute("href");
          // console.log(`github_url`, href);
          const result = setTempPaper({
            tempPaper,
            papers,
            paperItem: { github_url: href ? href : "" }
          });
          // console.log(`result`, result);
          tempPaper = result.tempPaper;
          papers = result.papers;
        }
      })
      .on('article div:first-child div:nth-child(3) > a:nth-child(3)', {
        element(element) {
          const href = element.getAttribute("href");
          console.log(`arxiv_url`, href);
          const result = setTempPaper({
            tempPaper,
            papers,
            paperItem: { arxiv_url: href ? href : "" }
          });
          // console.log(`result`, result);
          tempPaper = result.tempPaper;
          papers = result.papers;
        }
      })
      .transform(res)
      .arrayBuffer();
    // const detailedPapers: Paper[] = [];
    // for (const paper of papers) {
    //   if (paper.url) {
    //     try {
    //       const { abstract, date_published, author } = await this.extractAbstraction(
    //         paper.url,
    //         c,
    //       );
    //       detailedPapers.push({ ...paper, abstract, date_published, author });
    //     } catch (e) {
    //       console.error(`Failed to extract abstract for ${paper.url}: ${e}`);
    //       detailedPapers.push({ ...paper, abstract: "", date_published: null, author: '' });
    //     }
    //   }
    // }
    // console.log(`papers`, papers);
    return papers;
  }

  private async extractAbstraction(
    url: string,
    c: Record<string, any>,
  ): Promise<{ abstract: string; date_published: string | null, author: string }> {
    const res = await fetch(url);
    let abstract = "";
    let date_published: string | null = null;
    let authorList: string[] = [];
    await new HTMLRewriter()
      .on("div.pb-8.pr-4.md\\:pr-16", {
        text(text) {
          abstract += text.text;
        },
      })
      .on("div.pb-10.md\\:pt-3 .author span.contents", {
        text(text) {
            if(text.text){
                console.log(`Found author: ${text.text}`);
                // remove \n and extra spaces
                const theAuthor = text.text.replace(/\n/g, "").trim();
                if(theAuthor) {
                    authorList.push(theAuthor);
                }
            }
        },
      })
      .on("time", {
        element(element) {
          date_published = element.getAttribute("datetime");
        },
      })
      .transform(res)
      .arrayBuffer();
    if (abstract.startsWith("Abstract\n")) {
      abstract = abstract.substring("Abstract\n".length);
    }
    abstract = abstract.replace(/\n/g, " ").trim();
    if (date_published && !(date_published as string).endsWith("Z")) {
      date_published = `${date_published}Z`;
    }
    return { abstract, date_published, author: authorList.join(", ").trim() };
  }

}


function setTempPaper({
  tempPaper,
  papers,
  paperItem,
}: {
  tempPaper: Partial<Paper>,
  papers: Paper[],
  paperItem: Partial<Paper>
}): {
  tempPaper: Partial<Paper>,
  papers: Paper[],
} {
  if(paperItem.url) {
    tempPaper.url = paperItem.url;
  }
  if(paperItem.title) {
    tempPaper.title = paperItem.title;
  }
  if(paperItem.abstract) {
    tempPaper.abstract = paperItem.abstract;
  }
  if(paperItem.github_url) {
    tempPaper.github_url = paperItem.github_url;
  }
  if(paperItem.arxiv_url) {
    tempPaper.arxiv_url = paperItem.arxiv_url;
  }
  if(paperItem.upvotes) {
    tempPaper.upvotes = paperItem.upvotes;
  }
  if(tempPaper.url && tempPaper.title && tempPaper.abstract && tempPaper.github_url && tempPaper.arxiv_url && tempPaper.upvotes) {
    papers.push(tempPaper as Paper);
    tempPaper = {}
  }
  return {
    tempPaper,
    papers,
  }
}