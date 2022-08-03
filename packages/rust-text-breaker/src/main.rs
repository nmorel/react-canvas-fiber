extern crate unicode_segmentation;

use unicode_segmentation::UnicodeSegmentation;

use unicode_linebreak::{
    linebreaks, BreakOpportunity,
    BreakOpportunity::{Allowed, Mandatory},
};

fn main() {
    let text = "😈👿👹👺🤡💩👻💀Hello World !👽👾🤖🎃😺😹😻😼😽👪";
    let breaks: Vec<(usize, BreakOpportunity)> = linebreaks(text).collect();
    println!("breaks : {:#?}", breaks);
    let graphemes: Vec<(usize, &str)> = UnicodeSegmentation::grapheme_indices(text, true).collect();
    println!("graphemes : {:#?}", graphemes);
}
