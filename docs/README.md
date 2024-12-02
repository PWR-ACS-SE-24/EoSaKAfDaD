<h1 align="center">Inżynieria pozyskiwania i ochrony <br/> wiedzy z danych i baz danych</h1>

<div align="center">
Zespół G2 (steganografia obrazu): <br/> <b>Przemysław Barcicki (260324), Tomasz Chojnacki (260365), Jakub Zehner (260285)</b>
</div>

## Sprint 1 (11 października - 17 października)

Przeprowadzono wstępny przegląd literaturowy dotyczący wybranego przez grupę tematu (steganografia obrazu). W jego wyniku znaleziono następujące sposoby ukrywania treści w obrazach: **metoda najmniej znaczącego bitu** (LSB), **ukrywanie danych w częściach mało zauważalnych** (transform domain; np. DCT, DWT), **metoda przesunięcia kolorów**, **maskowanie i filtrowanie**, **metoda rozpraszania** (spread spectrum), **steganografia w warstwach alfa**. Wyniki realizacji tego etapu znajdują się w pliku `docs/initial-research.md`. *Ta część była wykonywana w większości przez Przemysława Barcickiego i Jakuba Zehnera.*

Wybrano technologię do realizacji projektu. Jest to **JavaScript**, co pozwoli tworzyć interaktywne wizualizacje bezpośrednio w przeglądarce internetowej. Do utworzenia układu strony wykorzystano **HTML** i **CSS** oraz bibliotekę Angular. Planowano również wykorzystać WebAssembly (WASM) w celu przyspieszenia kluczowych niskopoziomowych operacji. Wersję online projektu można znaleźć pod adresem [pwr-acs-se-24.github.io/EoSaKAfDaD](https://pwr-acs-se-24.github.io/EoSaKAfDaD/).

Utworzono szablon strony z paskiem bocznym, na którym umieszczane będą kolejne implementowane algorytmy. Dokonano wstępnej implementacji algorytmu **LSB**, w wariancie zezwalającym na zapis jedynie wiadomości zgodnych z kodem ASCII, niewykorzystującym kanału alfa oraz zerującym niewykorzystane bity. *Ta część była wykonywana w większości przez Tomasza Chojnackiego.*

*Na następny etap zaplanowano ulepszenie algorytmu LSB oraz rozpoczęcie implementacji algorytmu DCT.*

## Sprint 2 (18 października - 24 października)

Dokonano ulepszenia oraz optymalizacji algorytmu **LSB**. W tym celu zaimplementowano możliwość zapisu dowolnych danych binarnych, algorytm zapisuje od teraz również dane w kanale alfa, a niewykorzystane bity nie są zerowane. Prędkość wykonywania algorytmu wzrosła kilkukrotnie. *Ta część była wykonywana w większości przez Tomasza Chojnackiego.*

Pogłębiono badania nad steganografią obrazu. Znaleziono powiązane z tematem projektu zagadnienia, które warto byłoby zgłębić w kolejnych etapach realizacji. Są to **kryptografia wizualna** oraz **ukrywanie w metadanych**.

Rozpoczęto pracę nad implementacją algorytmu **DCT**. W tym celu dokonano dogłębnego przeglądu literatury dotyczącej tej metody, przetestowano alternatywne implementacje oraz zbadano działanie formatu **JPEG**. *Ta część była wykonywana w większości przez Przemysława Barcickiego i Jakuba Zehnera.*

*Na następny etap zaplanowano kontynuację prac nad algorytmem DCT, oraz poprawę drobnych błędów w projekcie.*

## Sprint 3 (25 października - 7 listopada)

Kontynuowano prace nad implementacją **DCT**. Zaimplementowano roboczą wersję algorytmu, która zostanie poprawiona w następnych etapach. W tym momencie nie dokonano jeszcze analizy porównawczej DCT z LSB. *Ta część była wykonywana w większości przez Przemysława Barcickiego i Jakuba Zehnera.*

Dokonano drobnych poprawek w projekcie, takich jak poprawa wyglądu i funkcjonalności strony, pod względem ergonomii przesyłania i pobierania analizowanych obrazów. *Ta część była wykonywana w większości przez Tomasza Chojnackiego.*

*Na następny etap zaplanowano finalizację algorytmu DCT oraz rozpoczęcie prac nad ukrywaniem w metadanych oraz budowę narzędzia do zniekształcania obrazów.*

## Sprint 4 (8 listopada - 21 listopada)

Wykonano całe narzędzie do **edycji** obrazów, pozwalające na skalowanie, dodawanie szumu, zmianę jasności i kontrastu. Umożliwi ono sprawdzenie odporności algorytmów steganograficznych na różne rodzaje zniekształceń. *Ta część była wykonywana w większości przez Tomasza Chojnackiego.*

W wyniku nieprzewidzianych komplikacji (długość dokumentacji JPEG) postanowiono poświęcić kolejny etap na research dotyczący **DCT**. *Ta część była wykonywana w większości przez Przemysława Barcickiego i Jakuba Zehnera.*

*Na następny etap zaplanowano dalsze prace nad DCT oraz badania nad kryptografią wizualną.*

## Sprint 5 (22 listopada - 28 listopada)

Zaimplementowano główną część algorytmu **DCT** dla obrazów JPEG. Możliwe jest ukrycie oraz odczytanie dowolnej wiadomości tekstowej i binarnej z różnymi ustawieniami liczby wykorzystanych bitów i jakości obrazu. *Ta część była wykonywana w większości przez Przemysława Barcickiego.*

Dodano narzędzie do **kryptografii wizualnej** dla obrazów monochromatycznych. Dla ułatwienia pracy, udostępnione jest też narzędzie do zamiany obrazów kolorowych i potencjalnie przezroczystych na czarno-białe stosując dwie metody zamiany na skalę szarości (średnia i jasność) oraz trzy metody monochromatyzacji (progowanie, dithering losowy i dithering Floyda-Steinberga). Następnie, narzędzie dzieli obraz na dwie części, które po nałożeniu na siebie dają obraz podobny do oryginalnego. *Ta część była wykonywana w większości przez Tomasza Chojnackiego.*

*Na następny etap zaplanowano ukończenie prac nad DCT, dodanie narzędzia do porównywania dwóch obrazów oraz powrót do prac nad ukrywaniem w metadanych.*

## Sprint 6 (29 listopada - 5 grudnia)

...
