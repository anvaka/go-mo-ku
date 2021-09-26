## Go-Mo-Ku

This repository allows you to play many variations of tic-tac-toe game with your friends.
The trick is that there is no server that synchronizes your moves. Instead the entire
game state is saved as part of the URL. So you can share the URL after each move with your
friend and wait for them to return a new URL with their move.

The game allows many variations:

* You can change size of the board by changing `w` and `h` parameters. E.g. this would be 10x10 board:
[https://anvaka.github.io/go-mo-ku/?**w=10&h=10**](https://anvaka.github.io/go-mo-ku/?w=10&h=10)
* You can change number of players too! If you want to play `X` vs `O` vs `Y` you can do it by
adjusting `s` parameter: [https://anvaka.github.io/go-mo-ku/?**s=XOY**](https://anvaka.github.io/go-mo-ku/?s=XOY&w=15&h=15&l=5)
* You can change the length of the winning sequence by using the `l` parameter. This would be 4-in-a-row wins [https://anvaka.github.io/go-mo-ku/?**l=4**](https://anvaka.github.io/go-mo-ku/?s=XO&w=15&h=15&l=4)

You can share a link on social media and play with your friends in asynchronous way.

## The algorithm

The algorithm that solves the game is described in great detail here:
https://www.patreon.com/posts/56576883 but [the source code](https://github.com/anvaka/go-mo-ku/blob/86748e396925e10d45d1655484889597ecd62ce1/src/GameBoard.js#L137) should also be well documented
and easy to follow.

## Thank you

Thank you for reading this. If you like this project, please consider [donating](https://www.patreon.com/anvaka) to support the author, or just follow him on [Twitter](https://twitter.com/anvaka) and share your thoughts.

## License

MIT