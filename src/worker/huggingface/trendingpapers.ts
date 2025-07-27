const BASE_URL = "https://huggingface.co/papers/trending";
interface Paper {
  title: string;
  url: string;
  abstract: string;
  date_published: string | null;
  author: string;
}
export class HuggingFaceScraper {
  async fetchPapers(c: any): Promise<Paper[]> {
    const res = await fetch(BASE_URL);
    const papers: { title: string; url: string }[] = [];
    let tempPaper = { title: "", url: "" };
    await new HTMLRewriter()
      .on("article", {
        text(text) {
          if (text.text) {
            tempPaper.title = text.text;
            if (tempPaper.url) {
              papers.push(tempPaper);
              tempPaper = { title: "", url: "" };
            }
            console.log(`Found paper: ${text.text}`, text);
          }
        },
        element(element) {
          const href = element.getAttribute("href");
          const title = element || "";
          console.log(`Found title: ${title}, href: ${href}`, element);
          if (href) {
            const url = `https://huggingface.co${href}`;
            tempPaper.url = url;
            console.log(`Found URL: ${url}`);
            if(tempPaper.title) {
              papers.push(tempPaper);
              tempPaper = { title: "", url: "" };
            }
          }
        },
      })
      .transform(res)
      .arrayBuffer();
    const detailedPapers: Paper[] = [];
    for (const paper of papers) {
      if (paper.url) {
        try {
          const { abstract, date_published, author } = await this.extractAbstraction(
            paper.url,
            c,
          );
          detailedPapers.push({ ...paper, abstract, date_published, author });
        } catch (e) {
          console.error(`Failed to extract abstract for ${paper.url}: ${e}`);
          detailedPapers.push({ ...paper, abstract: "", date_published: null, author: '' });
        }
      }
    }
    return detailedPapers;
  }


  private addToDetailedPapers({ 
    paper, abstract, date_published, author, detailedPapers 
}: { paper: { title: string; url: string }, abstract: string, date_published: string | null, author: string, detailedPapers: Paper[] }) {
    
    detailedPapers.push({ ...paper, abstract, date_published, author });
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
