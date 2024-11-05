Steganografia obrazów jest jedną z technik steganografii, która polega na ukrywaniu informacji w obrazach w sposób niewidoczny dla ludzkiego oka. Celem tej metody jest przekazanie tajnej wiadomości w sposób dyskretny, bez wzbudzania podejrzeń, że w ogóle ma miejsce komunikacja. W przeciwieństwie do kryptografii, która skupia się na zabezpieczaniu treści wiadomości, steganografia koncentruje się na ukryciu samego faktu jej istnienia.

Metody ukrywania treści w obrazach
1. Metoda najmniej znaczącego bitu (Least Significant Bit, LSB):
    - Najpopularniejsza i najprostsza metoda steganografii obrazów.
    - Polega na modyfikacji najmniej znaczącego bitu wartości koloru pikseli.
    - Na przykład, dla 8-bitowego koloru można zmienić ostatni bit (bit nr 0) każdej składowej RGB. Modyfikacja ta jest praktycznie niezauważalna dla ludzkiego oka.
    - Dla obrazu 24-bitowego (po 8 bitów na każdy z kanałów R, G i B) możliwe jest ukrycie znacznej ilości danych w stosunku do obrazu 8-bitowego (jednokanałowego).

2. Ukrywanie danych w częściach mało zauważalnych (Transform Domain):
    - Ta metoda polega na modyfikacji danych obrazu w jego domenie transformacyjnej, a nie bezpośrednio w domenie przestrzennej (czyli na pikselach).
    - Przykłady technik obejmują:
        - DCT (Discrete Cosine Transform): Popularna w obrazach JPEG. Informacja jest ukrywana w współczynnikach DCT obrazu. DCT dzieli obraz na bloki, a dane można wprowadzić w blokach o wysokiej częstotliwości, co czyni tę metodę mniej podatną na detekcję.
        - DWT (Discrete Wavelet Transform): Obraz jest dzielony na częstotliwości (niska i wysoka częstotliwość), a ukrywanie danych odbywa się zazwyczaj w wysokich częstotliwościach. Jest to bardziej zaawansowana metoda niż DCT.

3. Metoda przesunięcia kolorów:
    - Polega na delikatnej modyfikacji składowych koloru (np. R, G, B), zmieniając ich wartości w sposób, który nie jest zauważalny dla ludzkiego oka.
    - Można tu stosować techniki takie jak dodawanie lub odejmowanie wartości koloru o określonej wielkości w celu zakodowania informacji.

4. Maskowanie i filtrowanie:
    - Jest to bardziej zaawansowana technika, która wykorzystuje maski bitowe i filtrowanie, aby zakodować informację w obrazie. Stosowana jest głównie w obrazach w odcieniach szarości. Pochodna tej techniki jest używana przy kryptografi wizualnej, gdzie obraz wyjściowy jest osiągalny tylko i wyłącznie z obrazem "kluczem".
    - Polega na ukrywaniu danych w intensywnościach pikseli za pomocą maski bitowej, co jest szczególnie użyteczne w obrazach medycznych lub innych obrazach o wysokiej jakości, gdzie subtelne zmiany mogą być mniej zauważalne.

5. Metoda rozpraszania (Spread Spectrum):
    - Polega na rozproszeniu ukrywanej informacji na wiele pikseli w obrazie, przez co trudniej jest wykryć zakodowaną informację. Jest bardziej odporna na kompresję i inne techniki przetwarzania obrazu.
    - W tej metodzie używa się sekwencji pseudolosowych do wyboru pikseli, w których zostaną ukryte dane, co czyni tę metodę bardziej odporną na próby ekstrakcji danych.

6. Steganografia w warstwach alfa (kanał przezroczystości):
    - Jeśli obraz zawiera kanał alfa (odpowiedzialny za przezroczystość), możliwe jest ukrycie informacji w wartościach przezroczystości pikseli.
    - Metoda ta polega na modyfikacji wartości alfa w taki sposób, aby zmiany były subtelne i niewidoczne dla ludzkiego oka, ale wystarczające do zakodowania danych.

Źródła:
- R. Chandramouli, N. Memon "Analysis of LSB Based Image Steganography Techniques"
- C.P. Sumathi, T. Santanam, G. Umamaheswari "A Study of Various Steganographic Techniques Used for Information Hiding"
- S. Katzenbeisser, F. Petitcolas "Information Hiding Techniques for Steganography and Digital Watermaking"
