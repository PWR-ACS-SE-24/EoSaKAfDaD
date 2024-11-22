pub struct Rng {
    prev: u32,
}

impl Rng {
    pub fn new(seed: u32) -> Self {
        Self { prev: seed }
    }

    pub fn gen(&mut self) -> u32 {
        // https://en.wikipedia.org/wiki/Linear_congruential_generator#Parameters_in_common_use
        self.prev = 214013 * self.prev + 2531011;
        (self.prev >> 16) & 0x7FFF
    }
}
