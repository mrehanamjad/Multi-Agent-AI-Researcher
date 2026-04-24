import sys
import os
# Allow running this file directly as a script (uv run app/services/ai/tools.py)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

import requests
from bs4 import BeautifulSoup
from langchain.tools import tool
from tavily import TavilyClient
from rich import print

from app.config.conf import settings

tavily = TavilyClient(api_key=settings.TAVILY_API_KEY)

@tool
def web_search(query: str):
    """Searches the web for recent and reliable information on a topic. Returns Titles , URL and Snippets."""

    results = tavily.search(query=query, max_results=5) 
    # print(results)
    #     {
    #     'query': 'What is the latest research on AI?',
    #     'follow_up_questions': None,
    #     'answer': None,
    #     'images': [],
    #     'results': [
    #         {
    #             'url': 'https://arize.com/ai-research-papers/',
    #             'title': 'AI Research Papers',
    #             'content': 'Keep up with the latest in AI research. Follow the latest in generative AI research papers and stay ahead of cutting-edge advancements.',
    #             'score': 0.99942964,
    #             'raw_content': None
    #         },
    #         ...
    #     }
    
    out = []
    for result in results['results']:
        out.append(
            f"Title: {result['title']}\nURL: {result['url']}\nSnippet: {result['content'][:300]}\r"
        )
    
    final = "\n\n".join(out)
    print("tool returning data:", final)  # ← fixed: was joining output into the print string
    return final                          # ← fixed: return is now OUTSIDE the loop

@tool
def url_scraper(url: str) -> str:
    """
    Scrape and return clean the text content of a webpage from a given URL for deeper reading.
    Removes scripts, styles, and unnecessary noise.
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0"
        }

        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # Remove unwanted tags
        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        text = soup.get_text(separator=" ",strip=True)

        return text[:3000]  # limit for LLM

    except Exception as e:
        return f"ERROR: Failed to scrape {url} | {str(e)}"

# print(web_search.invoke("https://techcrunch.com/2026/04/20/tim-cook-stepping-down-as-apple-ceo-john-ternus-taking-over/"))