---
title: "How I built a Human-Like Memory for My Local LLM Without Using Any Special Library"
date: 2026-03-16T20:25:26+05:30
draft: false
tags: []
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 0
hiddenInHomeList: false
description: ""
cover:
  image: ""
  alt: ""
  caption: ""
---

This is a very naive and beginner way to just get the thing done in the most easy and raw way possible, I won't be using any specific library or complex code for this project, this is just an exploration code.

Ok, so I am a beginner coder, currently in my sophomore year of college, and recently I got super obsessed with running local AI models on my laptop using Ollama.

But there is a huge, annoying problem with local LLMs: **They are basically goldfish.**

Every time you restart your python script, the AI forgets who you are, what you like, and what you talked about yesterday. I wanted to code a simple, human-like memory for my AI from scratch.

I started with a really basic idea, hit a bunch of walls, and finally built something that actually works like a human brain. Here is my exact thinking process, all the logic explained simply, and the raw Python code to do it yourself.

---

### The Brainstorming & Fixing My Dumb Logic

Alright, so let's begin with the thinking. My very first draft was simple: _Just maintain a JSON file, dump all the chat history in it, and send the whole file to the AI every time I type a message._

**Q: Wait, that sounds easy! Why is that a bad idea?**
**A:** Because of the **Token Limit** (Context Window). Imagine the AI's brain has a tiny RAM size of 4,000 words. If I keep shoving our entire 6-month chat history into every single prompt, the AI will crash or completely forget the actual question I just asked.

**Q: Okay, so we can't save the whole chat. What if we divide it? Keep old chats in a folder, and only give the AI the current chat?**
**A:** Better! But what if I ask, _"Hey, what was that movie I told you I liked last week?"_ If the AI only has the _current_ chat in its RAM, it can't answer.

**Q: So how do human brains do it?**
**A:** Exactly! Humans don't remember every single word of a conversation. We remember **Facts, Intents, and Emotions**. If I tell you, _"I went to the park yesterday and I was looking at a golden retriever and suddenly some stupid just entered the park with his motor bike and almost hit me, I got startled and jumped in the water"_ you don't memorize the sentence. Your brain just extracts: `[friend jumped in pool when a bike came unexpectedly to hit him in the park yesterday]`.

We also **forget things over time** to keep our brains fast and clutter-free.

So, my final logic for the JSON file was just a list of extracted **Facts** with a **Strength Score**.

---

### The Raw Code & Core Logic

Let's build the basic engine...

First, let's setup our `brain.json` structure. It looks like this:

```json
{
  "short_term": [],
  "long_term": [
    {
      "memory": "Eshan loves coding in Python",
      "strength": 10,
      "last_mentioned": "2024-10-25"
    }
  ]
}
```

Now, let's write the code to talk to Ollama and inject only the relevant memories.

```python
import json
import requests
from datetime import datetime
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BRAIN_FILE = os.path.join(BASE_DIR, 'brain.json')


def load_brain():
    try:
        with open(BRAIN_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"short_term": [], "long_term": []}


def save_brain(brain_data):
    with open(BRAIN_FILE, 'w') as f:
        json.dump(brain_data, f, indent=4)


def ask_ollama(prompt, system_prompt="You are a helpful AI."):
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "gemma2:2b",
        "prompt": prompt,
        "system": system_prompt,
        "stream": False
    }
    response = requests.post(url, json=payload)
    return response.json()['response']


def chat_with_ai(user_input):
    brain = load_brain()

    # --- Build context from long term memory ---
    # Just grab all memories and pass them so AI knows who user is
    long_term_text = ""
    if brain["long_term"]:
        long_term_text = "What you remember about this person:\n"
        for m in brain["long_term"]:
            long_term_text += f"- {m['memory']}\n"

    # --- Build context from short term (current session conversation) ---
    # This is so AI remembers what was JUST said in this conversation
    short_term_text = ""
    for turn in brain["short_term"]:
        short_term_text += f"User: {turn['user']}\nAI: {turn['ai']}\n"

    system_prompt = f"""You are a personal AI assistant who remembers the user.

{long_term_text}

Conversation so far today:
{short_term_text}"""

    # Get AI response
    ai_response = ask_ollama(user_input, system_prompt)

    # Save this turn to short term
    brain["short_term"].append({
        "user": user_input,
        "ai": ai_response
    })

    save_brain(brain)
    print("AI:", ai_response)
```

**Q: Wait, where does the `long_term` list come from? How does the AI extract the facts?**
**A:** I'm so glad you asked. That brings us to the next level.

---

### The "Sleep Cycle" & Forgetting Curve

If we force the AI to extract facts _while_ we are chatting, the chat will lag. It will take 10 seconds to reply.

**Q: So when does it learn?**
**A:** When it sleeps! Or, in computer terms, when we stop typing.

I wrote a background function called `consolidate_memory()`. You run this function when the chat session ends (like when the user types "bye"). It takes the `short_term` buffer, asks Ollama to extract the hard facts, moves them to `long_term`, and clears the buffer.

```python
def consolidate_memory():
    brain = load_brain()

    if len(brain["short_term"]) == 0:
        print("Nothing to remember. Goodnight!")
        return

    print("Processing memories...")
    today = str(datetime.now().date())

    for turn in brain["short_term"]:
        user_message = turn["user"]

        # IMPROVEMENT 1: Added explicit instructions to ignore questions
        prompt = f"""Extract facts about the user from this message.
Rules:
1. If the message is a question, contains no facts, or is conversational filler, return: NOTHING
2. Only extract stated personal facts (hobbies, preferences, name, job, etc).
3. Do not output sentences, just raw facts joined by |||.

Message: "{user_message}"
Output:"""

        result = ask_ollama(prompt, "You are a data extractor. Return 'NOTHING' for questions or filler.")
        result = result.strip()

        if not result or result.upper() == "NOTHING" or len(result) < 5:
            continue

        facts = [f.strip() for f in result.split("|||") if len(f.strip()) > 5]

        for fact in facts:
            # IMPROVEMENT 2: Check for duplicates to increase strength
            found_existing = False
            for existing in brain["long_term"]:
                # Logic for overlap detection
                existing_words = set(existing["memory"].lower().split())
                new_words = set(fact.lower().split())
                overlap = len(existing_words & new_words)

                # If they are very similar (more than 60% overlap)
                if overlap / max(len(new_words), 1) > 0.6:
                    existing["strength"] += 2
                    print(f"  Strengthened: {existing['memory']} (Strength: {existing['strength']})")
                    found_existing = True
                    break

            # IMPROVEMENT 3: Only add new if it wasn't found
            if not found_existing:
                brain["long_term"].append(
                    {"memory": fact, "last_mentioned": today, "strength": 10}
                )
                print(f"  New memory saved: {fact}")

    brain["short_term"] = []
    save_brain(brain)
    print("Done! Goodnight!")
```

**Q: That’s so cool! But wait, you said human memory forgets stuff to keep the brain fast. How does the AI forget?**
**A:** Good catch! That’s exactly why we added that `"strength": 10` variable in the JSON. Right now, our code only _adds_ memories. If we don't delete the useless ones, our JSON file will explode, and the token limit will crash again.

Here is the raw logic for forgetting: Every time you run the python script, a small function checks the dates. For every day that passes, the memory loses 1 strength point. If the strength hits 0, it vanishes (or gets moved to a `cold_storage.json` just in case we ever want to read old logs).

But, if you mention the memory again during a chat, remember in Level 2 we wrote `item["strength"] += 2`? That pushes the memory back up! Just like real life: if you don’t play guitar for a year, you forget it. If you practice every day, the memory stays strong.

Let's write that quick forgetting function:

```python
def clean_up_memories():
    """Prunes memories based on strength decay over time."""
    brain = load_brain()
    today = datetime.now().date()
    surviving_memories = []

    for item in brain["long_term"]:
        # Ensure last_mentioned exists, fallback to today if missing
        last_date_str = item.get("last_mentioned", str(today))
        last_date = datetime.strptime(last_date_str, "%Y-%m-%d").date()
        days_passed = (today - last_date).days

        # Reduce strength by days passed
        current_strength = item["strength"] - days_passed

        if current_strength > 0:
            item["strength"] = current_strength
            item["last_mentioned"] = str(today)
            surviving_memories.append(item)
        else:
            print(f"  Memory faded away: {item['memory']}")

    brain["long_term"] = surviving_memories
    save_brain(brain)
    print("  Memory cleanup complete.")
```

---

### Touching Perfection (And The Future)

**Q: Okay, so this is perfect now?**
**A:** Well, it's perfect for a beginner project, but there is one final hurdle if you use this for years.

Right now, my logic is super raw: I am just dumping the entire long_term list into every prompt. As the list grows, we'll hit the token limit again!

To fix that, you'd eventually need to write a search function to only grab relevant memories (like if word in user_input:). But basic keyword searching is flawed. If I type "I love dogs," a keyword search looks for the exact word "dogs." What if I type "I love puppies"? The code won't find the "dogs" memory. Humans don't work like that. We understand vibes and context, not just exact words.

**The Level-Up: Vector Databases (ChromaDB)**
To make this 100% perfect, you would replace the JSON search with something called a Vector Database (like ChromaDB). I won't code it here to keep things simple, but basically, ChromaDB turns words into numbers. So "Dog" and "Puppy" are stored right next to each other mathematically.

If you use ChromaDB, you don't search by words, you search by _meaning_. That's how ChatGPT's actual memory works.

### Final Thoughts

This whole project started because I wanted my AI to feel a little more human. I wanted it to say, "Hey Sam, how was your Python exam yesterday?" without me having to remind it that I even had an exam.

By just using a few basic lists, a JSON file, and some clever background prompts, we built a digital brain. It has a short-term memory (active chat), a sleep cycle (extraction), and a forgetting curve (strength decay).

The best part? It runs completely offline on your own laptop with Ollama. No subscriptions, no data stealing, just you and your code.

If you want to try this, copy the functions above, put them in a `main.py` file, loop an `input()` for the chat, and let me know on my GitHub what the first thing your AI remembered about you was!

Peace out, keep coding. ✌️

Here is the complete JSON-based code so far.

---

### The Complete JSON Memory Script (Version 1.0)

If you just want the raw, working code we’ve built so far using just JSON and Python, here is the entire script. Put this in a file called `main.py`, make sure Ollama is running in the background, and run it!

```python
import json
import requests
from datetime import datetime
import os

# --- Configuration ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BRAIN_FILE = os.path.join(BASE_DIR, 'brain.json')


# --- Memory File Management ---
def load_brain():
    try:
        with open(BRAIN_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Automatically creates the corrrect structure if file doesn't exist
        return {"short_term": [], "long_term":[]}


def save_brain(brain_data):
    with open(BRAIN_FILE, 'w') as f:
        json.dump(brain_data, f, indent=4)


# --- Core AI Communication ---
def ask_ollama(prompt, system_prompt="You are a helpful AI."):
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "gemma2:2b", # Make sure you have this model pulled in Ollama!
        "prompt": prompt,
        "system": system_prompt,
        "stream": False
    }
    try:
        response = requests.post(url, json=payload)
        return response.json()['response']
    except requests.exceptions.ConnectionError:
        return "Error: Could not connect to Ollama. Is it running?"


# --- Chat Logic ---
def chat_with_ai(user_input):
    brain = load_brain()

    # --- Build context from long term memory ---
    long_term_text = ""
    if brain["long_term"]:
        long_term_text = "What you remember about this person:\n"
        for m in brain["long_term"]:
            long_term_text += f"- {m['memory']}\n"

    # --- Build context from short term (current session conversation) ---
    short_term_text = ""
    for turn in brain["short_term"]:
        short_term_text += f"User: {turn['user']}\nAI: {turn['ai']}\n"

    system_prompt = f"""You are a personal AI assistant who remembers the user.

{long_term_text}

Conversation so far today:
{short_term_text}"""

    # Get AI response
    ai_response = ask_ollama(user_input, system_prompt)

    # Save this turn to short term buffer
    brain["short_term"].append({
        "user": user_input,
        "ai": ai_response
    })

    save_brain(brain)
    print("\nAI:", ai_response)


# --- Sleep Cycle: Memory Consolidation ---
def consolidate_memory():
    brain = load_brain()

    if len(brain["short_term"]) == 0:
        print("Nothing to remember. Goodnight!")
        return

    print("\nProcessing memories...")
    today = str(datetime.now().date())

    for turn in brain["short_term"]:
        user_message = turn["user"]

        prompt = f"""Extract facts about the user from this message.
Rules:
1. If the message is a question, contains no facts, or is conversational filler, return: NOTHING
2. Only extract stated personal facts (hobbies, preferences, name, job, etc).
3. Do not output sentences, just raw facts joined by |||.

Message: "{user_message}"
Output:"""

        result = ask_ollama(prompt, "You are a data extractor. Return 'NOTHING' for questions or filler.")
        result = result.strip()

        if not result or result.upper() == "NOTHING" or len(result) < 5:
            continue

        facts =[f.strip() for f in result.split("|||") if len(f.strip()) > 5]

        for fact in facts:
            found_existing = False
            for existing in brain["long_term"]:
                # Logic for overlap detection
                existing_words = set(existing["memory"].lower().split())
                new_words = set(fact.lower().split())
                overlap = len(existing_words & new_words)

                # If they are very similar (more than 60% overlap)
                if overlap / max(len(new_words), 1) > 0.6:
                    existing["strength"] += 2
                    print(f"  Strengthened: {existing['memory']} (Strength: {existing['strength']})")
                    found_existing = True
                    break

            # Add new memory if it wasn't found (Using the 'last_mentioned' fix)
            if not found_existing:
                brain["long_term"].append(
                    {"memory": fact, "last_mentioned": today, "strength": 10}
                )
                print(f"  New memory saved: {fact}")

    # Clear the buffer
    brain["short_term"] =[]
    save_brain(brain)
    print("Done! Goodnight!")


# --- Forgetting Curve: Memory Cleanup ---
def clean_up_memories():
    """Prunes memories based on strength decay over time."""
    brain = load_brain()
    today = datetime.now().date()
    surviving_memories = []

    for item in brain["long_term"]:
        last_date_str = item.get("last_mentioned", str(today))
        last_date = datetime.strptime(last_date_str, "%Y-%m-%d").date()
        days_passed = (today - last_date).days

        # Reduce strength by days passed
        current_strength = item["strength"] - days_passed

        if current_strength > 0:
            item["strength"] = current_strength
            item["last_mentioned"] = str(today)
            surviving_memories.append(item)
        else:
            print(f"  Memory faded away: {item['memory']}")

    brain["long_term"] = surviving_memories
    save_brain(brain)
    print("Memory cleanup complete.")


# --- Main Application Loop ---
def main():
    print("--- Waking up AI ---")
    clean_up_memories()
    print("AI is ready! (Type 'bye' to sleep and save memoriies)\n")

    while True:
        user_input = input("You: ")

        if user_input.lower() in ["bye", "exit", "quit"]:
            print("\nAI: Goodbye! Going to sleep now...")
            consolidate_memory()
            break

        chat_with_ai(user_input)

if __name__ == "__main__":
    main()
```
