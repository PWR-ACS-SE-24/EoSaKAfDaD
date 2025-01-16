<h1 align="center">Inżynieria pozyskiwania i ochrony <br/> wiedzy z danych i baz danych</h1>

<div align="center">
Zespół G2 (steganografia obrazu): <br/> <b>Przemysław Barcicki (260324), Tomasz Chojnacki (260365), Jakub Zehner (260285)</b>
</div>

## Sprint 1 (11 października - 17 października)

Przeprowadzono wstępny przegląd literaturowy dotyczący wybranego przez grupę tematu (steganografia obrazu). W jego wyniku znaleziono następujące sposoby ukrywania treści w obrazach: **metoda najmniej znaczącego bitu** (LSB), **ukrywanie danych w częściach mało zauważalnych** (transform domain; np. DCT, DWT), **metoda przesunięcia kolorów**, **maskowanie i filtrowanie**, **metoda rozpraszania** (spread spectrum), **steganografia w warstwach alfa**. Wyniki realizacji tego etapu znajdują się w pliku `docs/initial-research.md`. _(P. Barcicki, J. Zehner)_

Wybrano technologię do realizacji projektu. Jest to **JavaScript**, co pozwoli tworzyć interaktywne wizualizacje bezpośrednio w przeglądarce internetowej. Do utworzenia układu strony wykorzystano **HTML** i **CSS** oraz bibliotekę Angular. Planowano również wykorzystać WebAssembly (WASM) w celu przyspieszenia kluczowych niskopoziomowych operacji. Wersję online projektu można znaleźć pod adresem [pwr-acs-se-24.github.io/EoSaKAfDaD](https://pwr-acs-se-24.github.io/EoSaKAfDaD/).

Utworzono szablon strony z paskiem bocznym, na którym umieszczane będą kolejne implementowane algorytmy. Dokonano wstępnej implementacji algorytmu **LSB**, w wariancie zezwalającym na zapis jedynie wiadomości zgodnych z kodem ASCII, niewykorzystującym kanału alfa oraz zerującym niewykorzystane bity. _(T. Chojnacki)_

_Na następny etap zaplanowano ulepszenie algorytmu LSB oraz rozpoczęcie implementacji algorytmu DCT._

## Sprint 2 (18 października - 24 października)

Dokonano ulepszenia oraz optymalizacji algorytmu **LSB**. W tym celu zaimplementowano możliwość zapisu dowolnych danych binarnych, algorytm zapisuje od teraz również dane w kanale alfa, a niewykorzystane bity nie są zerowane. Prędkość wykonywania algorytmu wzrosła kilkukrotnie. _(T. Chojnacki)_

Pogłębiono badania nad steganografią obrazu. Znaleziono powiązane z tematem projektu zagadnienia, które warto byłoby zgłębić w kolejnych etapach realizacji. Są to **kryptografia wizualna** oraz **ukrywanie w metadanych**.

Rozpoczęto pracę nad implementacją algorytmu **DCT**. W tym celu dokonano dogłębnego przeglądu literatury dotyczącej tej metody, przetestowano alternatywne implementacje oraz zbadano działanie formatu **JPEG**. _(P. Barcicki, J. Zehner)_

_Na następny etap zaplanowano kontynuację prac nad algorytmem DCT, oraz poprawę drobnych błędów w projekcie._

## Sprint 3 (25 października - 7 listopada)

Kontynuowano prace nad implementacją **DCT**. Zaimplementowano roboczą wersję algorytmu, która zostanie poprawiona w następnych etapach. W tym momencie nie dokonano jeszcze analizy porównawczej DCT z LSB. _(P. Barcicki, J. Zehner)_

Dokonano drobnych poprawek w projekcie, takich jak poprawa wyglądu i funkcjonalności strony, pod względem ergonomii przesyłania i pobierania analizowanych obrazów. _(T. Chojnacki)_

_Na następny etap zaplanowano finalizację algorytmu DCT oraz rozpoczęcie prac nad ukrywaniem w metadanych oraz budowę narzędzia do zniekształcania obrazów._

## Sprint 4 (8 listopada - 21 listopada)

Wykonano całe narzędzie do **edycji** obrazów, pozwalające na skalowanie, dodawanie szumu, zmianę jasności i kontrastu. Umożliwi ono sprawdzenie odporności algorytmów steganograficznych na różne rodzaje zniekształceń. _(T. Chojnacki)_

W wyniku nieprzewidzianych komplikacji (długość dokumentacji JPEG) postanowiono poświęcić kolejny etap na research dotyczący **DCT**. _(P. Barcicki, J. Zehner)_

_Na następny etap zaplanowano dalsze prace nad DCT oraz badania nad kryptografią wizualną._

## Sprint 5 (22 listopada - 28 listopada)

Zaimplementowano główną część algorytmu **DCT** dla obrazów JPEG. Możliwe jest ukrycie oraz odczytanie dowolnej wiadomości tekstowej i binarnej z różnymi ustawieniami liczby wykorzystanych bitów i jakości obrazu. _(P. Barcicki)_

Dodano narzędzie do **kryptografii wizualnej** dla obrazów monochromatycznych. Dla ułatwienia pracy, udostępnione jest też narzędzie do zamiany obrazów kolorowych i potencjalnie przezroczystych na czarno-białe stosując dwie metody zamiany na skalę szarości (średnia i jasność) oraz trzy metody monochromatyzacji (progowanie, dithering losowy i dithering Floyda-Steinberga). Następnie, narzędzie dzieli obraz na dwie części, które po nałożeniu na siebie dają obraz podobny do oryginalnego. _(T. Chojnacki)_

_Na następny etap zaplanowano ukończenie prac nad DCT, dodanie narzędzia do porównywania dwóch obrazów oraz powrót do prac nad ukrywaniem w metadanych._

## Sprint 6 (29 listopada - 5 grudnia)

Zakończono prace nad **DCT** dla JPEG. Dostępne jest narzędzie do ukrywania i odczytu danych z tego typu obrazów z podaną jakością i liczbą wykorzystywanych bitów. _(P. Barcicki)_

Zaimplementowano prosty wariant **kryptografii wizualnej**. Narzędzie pozwala na zamianę obrazu na jego wersję monochromatyczną (bazując na wartości pikseli oraz jasności YCbCr; z trzema opcjami ditheringu: progowaniem, ditheringiem losowym i ditheringiem Floyda-Steinberga), jego podział na dwie części z wykorzystaniem odpowiednich wzorów oraz na nakładanie tych części na siebie. _(T. Chojnacki)_

Rozpoczęto prace nad **ukrywaniem w metadanych**. Powstał prototyp pozwalający na ukrywanie w obrazach PNG danych oraz ich odczyt z wykorzystaniem odpowiedniego klucza. _(J. Zehner)_

Dokonano wielu zmian w wewnętrznym kodzie projektu, sprawiających, że jest on łatwiejszy w utrzymaniu i rozbudowie, szybszy i bardziej przejrzysty. _(P. Barcicki, T. Chojnacki)_

_Na następny etap zaplanowano kontynuację prac nad ukrywaniem w metadanych oraz stworzenie narzędzia do porównywania obrazów._

## Sprint 7 (6 grudnia - 12 grudnia)

Zakończono **ukrywanie w metadanych** dla obrazów PNG. Jednocześnie rozpoczęto prace nad ukrywaniem w metadanych dla obrazów JPEG. _(J. Zehner)_

Stworzono narzędzie do **porównywania obrazów**. Pozwala ono zapisać dwa dowolne obrazy z aplikacji, a następnie porównać je pod względem różnic z dostosowaniem różnych parametrów. _(P. Barcicki)_

Dodano poprawki do przycisków służących do przesyłania i pobierania obrazów, poprawiając ich style, logikę walidacji oraz integrację z komponentem wyświetlającym obrazy. _(T. Chojnacki)_

_Na następny etap zaplanowano dalsze prace nad ukrywaniem w metadanych oraz implementację ukrywania z użyciem transformaty falkowej._

## Sprint 8 (14 grudnia - 20 grudnia)

Wykonano **ukrywanie z użyciem transformaty falkowej**. W związku z małą dostępnością odpowiednich narzędzi w języku JavaScript, ten etap zaimplementowano w Pythonie i jest on dostępny w pliku `docs/wavelet.py`. Program ten rozszczepia obrazy kolorowe na trzy kanały (R, G, B), a następnie działa osobno na każdym z nich, traktując go jako sygnał. Na wejściu do programu podane są dwa obrazy: `source.jpg` - obraz źródłowy oraz `secret.jpg` - dwa razy mniejszy obraz zawierający informacje do ukrycia. W każdym kanale wejściowego obrazu dokonywana jest transformata falkowa, a następnie jego szczegóły zastąpione są poprzez treść odpowiadającego kanału z obrazu ukrytego. W wyniku uzyskujemy obraz, który wizualnie przypomina oryginalny, ale w swoich detalach ukrywa sekret. Następnie dokonywane jest przekształcenie odwrotne, wyciągające ukrytą informację.

_Na następny etap zaplanowano skończenie ukrywania w metadanych oraz rozpoczęcie przygotowywania projektu do oddania._

## Sprint 9 (10 stycznia - 16 stycznia)

Zakończono **ukrywanie w metadanych** dla obrazów JPG. _(J. Zehner)_
Zakończono przygotowywanie projektu do oddania.

## Podsumowanie

W ramach projektu udało nam się zrealizować następujące metody steganografii obrazu:

- **LSBv1** - ukrywanie danych tekstowych i binarnych w najmniej znaczących bitach obrazu
- **LSBv2** - wzbogacenie poprzedniej wersji o możliwość ukrywania danych w kanale alfa oraz ukrywania dowolnych danych binarnych
- **DCT** - ukrywanie danych w dyskretnej transformacie kosinusowej obrazu JPEG
- **Kryptografia wizualna** - ukrywanie danych za pomocą podziału obrazu monochromatycznego na dwie części
- **Ukrywanie w metadanych JPEG** - ukrywanie danych w niewykorzystanych blokach formatu JPEG
- **Ukrywanie w metadanych PNG** - ukrywanie danych w niewykorzystanych blokach formatu PNG
- **Ukrywanie z użyciem transformaty falkowej** - ukrywanie danych w obrazach kolorowych

Oprócz tego zaimplementowano narzędzia do:

- **Edycji obrazów** - skalowanie, dodawanie szumu, zmiana jasności i kontrastu
- **Porównywania obrazów** - porównywanie dwóch obrazów pod względem różnic

Wszystkie zaimplementowane algorytmy są dostępne w formie interaktywnego narzędzia internetowego, dostępnego pod adresem [pwr-acs-se-24.github.io/EoSaKAfDaD](https://pwr-acs-se-24.github.io/EoSaKAfDaD/).

W ramach projektu udało nam się poznać wiele nowych algorytmów, przeczytać wiele artykułów naukowych oraz zaimplementować wiele rozwiązań. Poznaliśmy wady i zalety różnych metod steganografii obrazu, wzbogaciliśmy swoją wiedzę o przetwarzaniu obrazów, a także nauczyliśmy się korzystać z wielu nowych technologii. Projekt pozwolił nam na zdobycie doświadczenia w pracy zespołowej oraz w podziale zadań.
