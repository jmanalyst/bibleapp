let bibleData = [];
let lastSearchQuery = "";

fetch('/public/kjv.json')
  .then(res => res.json())
  .then(data => {
    // Check and load the actual verses
    if (Array.isArray(data)) {
      bibleData = data;
      console.log("Bible data loaded:", bibleData.length, "verses (raw array)");
    } else if (Array.isArray(data.verses)) {
      bibleData = data.verses;
      console.log("Bible data loaded:", bibleData.length, "verses (from .verses key)");
    } else {
      console.error("Unexpected data format in kjv.json:", data);
    }
  })
  .catch(err => {
    console.error("Failed to load kjv.json:", err);
  });



// ===== BOOKS =====
const books = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
  "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians",
  "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const bookAbbreviations = {
  "Genesis": "Gen", "Exodus": "Exo", "Leviticus": "Lev", "Numbers": "Num", "Deuteronomy": "Deu",
  "Joshua": "Jos", "Judges": "Jud", "Ruth": "Rut", "1 Samuel": "1Sa", "2 Samuel": "2Sa",
  "1 Kings": "1Ki", "2 Kings": "2Ki", "1 Chronicles": "1Ch", "2 Chronicles": "2Ch", "Ezra": "Ezr",
  "Nehemiah": "Neh", "Esther": "Est", "Job": "Job", "Psalms": "Psa", "Proverbs": "Pro",
  "Ecclesiastes": "Ecc", "Song of Solomon": "Son", "Isaiah": "Isa", "Jeremiah": "Jer",
  "Lamentations": "Lam", "Ezekiel": "Eze", "Daniel": "Dan", "Hosea": "Hos", "Joel": "Joel",
  "Amos": "Amo", "Obadiah": "Oba", "Jonah": "Jon", "Micah": "Mic", "Nahum": "Nah",
  "Habakkuk": "Hab", "Zephaniah": "Zep", "Haggai": "Hag", "Zechariah": "Zec", "Malachi": "Mal",
  "Matthew": "Mat", "Mark": "Mar", "Luke": "Luk", "John": "Joh", "Acts": "Act", "Romans": "Rom",
  "1 Corinthians": "1Co", "2 Corinthians": "2Co", "Galatians": "Gal", "Ephesians": "Eph",
  "Philippians": "Phi", "Colossians": "Col", "1 Thessalonians": "1Th", "2 Thessalonians": "2Th",
  "1 Timothy": "1Ti", "2 Timothy": "2Ti", "Titus": "Tit", "Philemon": "Phm", "Hebrews": "Heb",
  "James": "Jam", "1 Peter": "1Pe", "2 Peter": "2Pe", "1 John": "1Jo", "2 John": "2Jo",
  "3 John": "3Jo", "Jude": "Jud", "Revelation": "Rev"
};

const chapterCounts = {
  "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34, "Joshua": 24,
  "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24, "1 Kings": 22, "2 Kings": 25,
  "1 Chronicles": 29, "2 Chronicles": 36, "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42,
  "Psalms": 150, "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66,
  "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12, "Hosea": 14, "Joel": 3,
  "Amos": 9, "Obadiah": 1, "Jonah": 4, "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3,
  "Haggai": 2, "Zechariah": 14, "Malachi": 4, "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21,
  "Acts": 28, "Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6,
  "Ephesians": 6, "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5, "2 Thessalonians": 3,
  "1 Timothy": 6, "2 Timothy": 4, "Titus": 3, "Philemon": 1, "Hebrews": 13, "James": 5,
  "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1, "3 John": 1, "Jude": 1, "Revelation": 22
};

let currentBook = "";
let currentChapter = 0;
let currentVerse = 0;

// You already have functions: getChapter, getVerse, prevChapter, nextChapter
// These need slight extension for nextVerse/prevVerse/fullChapter

function showPrevNextVerseButtons(ref) {
  const result = document.getElementById("result");
  const btns = `
    <div class="flex gap-2 mt-4">
      <button onclick="prevVerse()" class="text-sm border border-black px-2 py-1 rounded hover:bg-gray-100">Previous Verse</button> 
      <button onclick="readFullChapter()" class="text-sm border border-black px-2 py-1 rounded hover:bg-gray-100">Full Chapter</button>
      <button onclick="nextVerse()" class="text-sm border border-black px-2 py-1 rounded hover:bg-gray-100">Next Verse</button>
    </div>
  `;
  result.innerHTML += btns;
}

function readFullChapter() {
  getChapter(currentBook, currentChapter);
}

function nextVerse() {
  getVerseFromRef(currentBook, currentChapter, currentVerse + 1);
}

function prevVerse() {
  if (currentVerse > 1) {
    getVerseFromRef(currentBook, currentChapter, currentVerse - 1);
  }
}




function getVerseFromRef(book, chapter, verse) {
  currentBook = book;
  currentChapter = chapter;
  currentVerse = verse;

  const result = document.getElementById("result");
  result.innerHTML = "Loading...";
  showResultArea();

  const verseObj = bibleData.find(v =>
    v.book_name && v.book_name.toLowerCase() === book.toLowerCase() &&
    v.chapter === parseInt(chapter) &&
    v.verse === parseInt(verse)
  );

  if (verseObj) {
    result.innerHTML = `
      <p class="font-semibold text-xl mb-2">"${verseObj.text.trim()}"</p>
      <p class="text-sm text-gray-500">– ${book} ${chapter}:${verse}</p>
    `;
    showPrevNextVerseButtons(`${book} ${chapter}:${verse}`);
  } else {
    result.innerHTML = "Verse not found.";
  }
}




// Book Picker Modal
function openBookPicker() {
  const modal = document.getElementById("book-picker");
  const oldTestament = document.getElementById("old-testament");
  const newTestament = document.getElementById("new-testament");

  oldTestament.innerHTML = "";
  newTestament.innerHTML = "";

  const oldBooks = books.slice(0, 39);
  const newBooks = books.slice(39);

  oldBooks.forEach(book => {
    const btn = document.createElement("button");
    btn.textContent = bookAbbreviations[book] || book.substring(0, 3);
    btn.className = "border rounded px-2 py-1 text-sm hover:bg-blue-100";
    btn.onclick = () => selectBook(book);
    oldTestament.appendChild(btn);
  });

  newBooks.forEach(book => {
    const btn = document.createElement("button");
    btn.textContent = bookAbbreviations[book] || book.substring(0, 3);
    btn.className = "border rounded px-2 py-1 text-sm hover:bg-blue-100";
    btn.onclick = () => selectBook(book);
    newTestament.appendChild(btn);
  });

  modal.classList.remove("hidden");
}



function closeBookPicker() {
  document.getElementById("book-picker").classList.add("hidden");
}



function selectBook(book) {
  document.getElementById("book").value = book;
  document.getElementById("chapter").value = "";
  document.getElementById("verse").value = "";
  closeBookPicker();
  updatePillLabels(); 
  openChapterPicker();

  maybeAutoFetch();
}


// When chapter changes, reset verse
function openChapterPicker() {
  const book = document.getElementById("book").value;
  if (!book || !chapterCounts[book]) return;

  const grid = document.getElementById("chapter-grid");
  grid.innerHTML = "";

  for (let i = 1; i <= chapterCounts[book]; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "px-2 py-1 rounded hover:bg-gray-200";
    btn.onclick = () => {
      document.getElementById("chapter").value = i;
      document.getElementById("verse").value = ""; // reset verse
      closeChapterPicker();
      updatePillLabels(); 
      maybeAutoFetch();
    };
    grid.appendChild(btn);
  }

  document.getElementById("chapter-picker-title").textContent = `Select Chapter (${book})`;
  document.getElementById("chapter-picker").classList.remove("hidden");
}



function closeChapterPicker() {
  document.getElementById("chapter-picker").classList.add("hidden");
}





// === VERSE PICKER ===
function openVersePicker() {
  const book = document.getElementById("book").value.trim();
  const chapter = document.getElementById("chapter").value.trim();
  if (!book || !chapter) return;

  const grid = document.getElementById("verse-grid");
  const title = document.getElementById("verse-picker-title");
  const modal = document.getElementById("verse-picker");

  grid.innerHTML = "Loading...";
  title.textContent = `Select Verse (${book} ${chapter})`;
  modal.classList.remove("hidden");

  // Get verses from local data
  const verses = bibleData.filter(v =>
    v.book_name && v.book_name.toLowerCase() === book.toLowerCase() &&
    v.chapter === parseInt(chapter)
  );

  if (verses.length === 0) {
    grid.innerHTML = "<div class='col-span-6 text-gray-500'>No verses found</div>";
    return;
  }

  grid.innerHTML = "";
  verses.forEach(v => {
    const btn = document.createElement("button");
    btn.textContent = v.verse;
    btn.className = "bg-gray-100 hover:bg-green-200 rounded px-2 py-1";
    btn.onclick = () => {
      document.getElementById("verse").value = v.verse;
      closeVersePicker();
      updatePillLabels();
      maybeAutoFetch();
    };
    grid.appendChild(btn);
  });
}


function closeVersePicker() {
  document.getElementById("verse-picker").classList.add("hidden");
  
}



document.addEventListener("DOMContentLoaded", () => {
  // Already present:
  document.getElementById("verse").addEventListener("click", openVersePicker);

  // ✅ New: Listen for form submit
  document.getElementById("search-form").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent page reload
    const query = document.getElementById("searchQuery").value;
    searchBible(query);

      // ✅ Listen for radio filter change
  document.querySelectorAll('input[name="filter"]').forEach(radio => {
    radio.addEventListener("change", () => {
      if (lastSearchQuery) {
        searchBible(lastSearchQuery);
      }
    });
  });
    
  });
});




function getVerse() {
  const book = document.getElementById("book").value.trim();
  const chapter = document.getElementById("chapter").value.trim();
  const verse = document.getElementById("verse").value.trim();
  const result = document.getElementById("result");

  if (!book || !chapter) {
    result.innerHTML = "Please select both a book and chapter.";
    return;
  }

  // Set current state
  currentBook = book;
  currentChapter = parseInt(chapter);
  currentVerse = verse ? parseInt(verse) : 0;

  result.innerHTML = "Loading...";
  showResultArea();

  if (verse === "") {
    getChapter(book, chapter);
  } else {
    getVerseFromRef(book, parseInt(chapter), parseInt(verse));
  }
}





async function getChapter(book, chapter) {
  const result = document.getElementById("result");
  result.innerHTML = "Loading...";
  showResultArea();

  currentBook = book;
  currentChapter = parseInt(chapter);
  currentVerse = 0; // reset verse

  // Filter verses from local JSON
  const verses = bibleData.filter(v =>
    v.book_name && v.book_name.toLowerCase() === book.toLowerCase() &&
    v.chapter === parseInt(chapter)
  );

  if (verses.length > 0) {
    const verseList = verses.map(v => `<strong>${v.verse}</strong>. ${v.text.trim()}`).join("\n\n");

    result.innerHTML = `
      <h2 class="text-xl font-bold mb-4">${book} ${chapter}</h2>
      <pre class="whitespace-pre-wrap font-sans text-base leading-relaxed">${verseList}</pre>
      <div class="flex justify-between items-center mt-4">
        <button onclick="prevChapter()" class="text-sm border border-black px-3 py-1 rounded hover:bg-gray-100"${currentChapter === 1 ? ' disabled' : ''}>Previous Chapter</button>
        <button onclick="nextChapter()" class="text-sm border border-black px-3 py-1 rounded hover:bg-gray-100">Next Chapter</button>
      </div>
    `;
  } else {
    result.innerHTML = "Chapter not found.";
  }
}




function nextChapter() {
  getChapter(currentBook, currentChapter + 1);
}

function prevChapter() {
  if (currentChapter > 1) {
    getChapter(currentBook, currentChapter - 1);
  }
}






function maybeAutoFetch() {
  const book = document.getElementById("book").value.trim();
  const chapter = document.getElementById("chapter").value.trim();
  const verse = document.getElementById("verse").value.trim();

  if (book && chapter && verse) {
    getVerseFromRef(book, parseInt(chapter), parseInt(verse));
  } else if (book && chapter && verse === "") {
    getChapter(book, chapter);
  }
}





function updatePillLabels() {
  document.getElementById("pill-book").textContent = document.getElementById("book").value || "Book";
  document.getElementById("pill-chapter").textContent = document.getElementById("chapter").value || "Chapter";
  document.getElementById("pill-verse").textContent = document.getElementById("verse").value || "Verse";
}



let recognition; // global so we can stop it later

function startListening() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech recognition not supported.");
    return;
  }

  if (recognition) {
    recognition.stop(); // Stop any ongoing recognition
  }

  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    parseSpeechInput(transcript);
    recognition.stop(); // Automatically stop after result
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    recognition.stop();
  };

  recognition.onend = () => {
    recognition = null; // clear it so it's ready next time
  };

  recognition.start();
}

function parseSpeechInput(input) {
  input = input.trim().toLowerCase();

  // Convert numbers like "three nineteen" to "3 19" if needed
  // Optional: You can add a number word-to-digit converter if you want

  // Try to match known book names
  const matchedBook = books.find(book => input.startsWith(book.toLowerCase()));
  if (!matchedBook) {
    alert("Could not recognize book name.");
    return;
  }

  const rest = input.replace(matchedBook.toLowerCase(), "").trim(); // e.g. "319" or "3 19"

  // Match patterns like "3 19" or "319"
  let chapter = "", verse = "";

  if (/^\d{1,3}\s\d{1,3}$/.test(rest)) {
    [chapter, verse] = rest.split(" ");
  } else if (/^\d{2,4}$/.test(rest)) {
    // e.g. "319" → 3:19, "113" → 1:13
    if (rest.length === 3) {
      chapter = rest[0];
      verse = rest.slice(1);
    } else if (rest.length === 4) {
      chapter = rest.slice(0, 2);
      verse = rest.slice(2);
    } else {
      alert("Couldn't parse chapter and verse.");
      return;
    }
  } else {
    alert("Please speak clearly: e.g., 'John 3 16' or 'Matthew 3 19'");
    return;
  }

  // Set values in inputs
   // Set values in inputs
  document.getElementById("book").value = matchedBook;
  document.getElementById("chapter").value = chapter;
  document.getElementById("verse").value = verse;

  updatePillLabels();
  showResultArea(); // Show results section
  getVerseFromRef(matchedBook, parseInt(chapter), parseInt(verse)); // ← FETCH the scripture!
}




function searchBible(query) {
  const result = document.getElementById("result");
  showResultArea();

  query = query.trim().toLowerCase();
  if (!query) return;

  lastSearchQuery = query;

  const filter = document.querySelector('input[name="filter"]:checked').value;
  const currentBook = document.getElementById("book").value;

  let filteredData = [...bibleData];

  if (filter === "ot") {
  filteredData = filteredData.filter(v => {
    const index = books.findIndex(b => b.toLowerCase() === v.book_name.toLowerCase());
    return index > -1 && index < 39;
  });
} else if (filter === "nt") {
  filteredData = filteredData.filter(v => {
    const index = books.findIndex(b => b.toLowerCase() === v.book_name.toLowerCase());
    return index >= 39;
  });
} else if (filter === "book" && currentBook) {
  filteredData = filteredData.filter(v => v.book_name.toLowerCase() === currentBook.toLowerCase());
}

  const matches = filteredData.filter(v =>
    v.text.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    result.innerHTML = `No verses found for "${query}".`;
    return;
  }

  const rendered = matches.map(v => {
    const regex = new RegExp(`(${query})`, 'gi');
    const highlighted = v.text.replace(regex, '<mark>$1</mark>');

    return `<div class="mb-3">
      <p class="text-sm text-gray-500">${v.book_name} ${v.chapter}:${v.verse}</p>
      <p class="text-base leading-relaxed">${highlighted}</p>
    </div>`;
  }).join("");

  result.innerHTML = `
    <h2 class="text-lg font-semibold mb-4">Results for "${query}" (${matches.length} found):</h2>
    <div>${rendered}</div>
  `;
}