<template>
    <TheLesson
        :code="code"
        :options="{
            size: { x: 4, y: 2 },
            start: {
                position: { x: 0, y: 1 },
                orientation: 'E',
                picked: {},
            },
            walls: {
                x: Math.random() < 0.6 ? [
                    {x: 0, y: 1}
                ] : undefined
            },
            objects: [
                {
                    position: { x: 3, y: 0 },
                    type: 'grass',
                    fixed: true
                },
                {
                    position: { x: 3, y: 1 },
                    type: 'grass',
                    fixed: true
                },
            ],
            timeout: 1000
        }"
    />
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import TheLesson from "~/components/TheLesson.vue";

@Component({
    components: { TheLesson },
})
export default class LessonSimpleIf extends Vue {
    code:string = `/*
    IF Statement
    ============

    In this scenario, Miorița is very hungry.
    We want to help her reach the closest grass zone.
    Problem is a wall that may appear at random right in front of her.
    When the wall appears, she needs to go around the wall, to the top grass.
    There is a random chance the wall won't appear, so she can go straight to
    the bottom grass.

    For this, we use a special instruction "if()", that accepts a condition.
    The condition is just an instruction that happens to return true or false.
    We also have the "canMove()" instruction which happens to return true when
    Miorița can move forward, and false if she cannot.
    Combining the two allows us to run a set of instructions, depending on the
    ability to move.
*/
if ( canMove() ) {
    /*
        Using { curly braces } allows running multiple instructions in response
        to a single condition. These are called "code blocks"
    */

    move()
    move()
    move()
} else {
    /*
        The "else" statement can be attached to an "if" statement and represents
        instructions that run when the "if" condition is false.
    */

    turnRight()
    turnRight()
    turnRight()
    // Turing right 3 times gets us to the same result as turning left one time

    move()
    turnRight()
    move()
    move()
    move()
}

// After the if+else statements, we can continue doing stuff...

// The next instruction makes Miorița move to the start position.
// It is a code alternative to the "Reset" button.
reset()

/*
    Both the "if", and the "else" blocks end with the move() instruction used
    multiple times.
    Seeing the sheepfold from above, we can notice that once Miorița is facing
    left, she always has to move 3 times.
    We can move the 3 instructions after the if+else statement.
    We can also remove the "else" statement if we use the ! operator in the
    "if" condition. ! flips the expression after it.
    So true becomes false, and false becomes true
*/
if ( ! canMove() ) {
    /*
        The "else" statement can be attached to an "if" statement and represents
        instructions that run when the "if" condition is false.
    */

    turnRight()
    turnRight()
    turnRight()
    // Turing right 3 times gets us to the same result as turning left one time

    move()
    turnRight()
}

// Run the 3 move commands regardless of anything else
move()
move()
move()

/*
    Final note #1
    -------------
    You may notice that "if" and "else" are colored differently,
    and also they do not cause any output in the console.
    They are statements of the language, not just functions made specifically
    for this application.

    Final note #2
    -------------
    There are a lot of spaces in the code used in this lesson.
    None of them is required, but they make the code slightly more readable.
*/
`;
}
</script>
