import { MathSol } from './basicOperations';

// PairType = 'token->token'
// SwapType = 'swapExactIn'
// Would it be better to call this _calcOutGivenIn?
export function _exactTokenInForTokenOut(
    balanceIn: bigint,
    weightIn: bigint,
    balanceOut: bigint,
    weightOut: bigint,
    amountIn: bigint,
    fee: bigint
): bigint {
    // is it necessary to check ranges of variables? same for the other functions
    amountIn = subtractFee(amountIn, fee);
    const exponent = MathSol.divDownFixed(weightIn, weightOut);
    const denominator = MathSol.add(balanceIn, amountIn);
    const base = MathSol.divUpFixed(balanceIn, denominator);
    const power = MathSol.powUpFixed(base, exponent);
    return MathSol.mulDownFixed(balanceOut, MathSol.complementFixed(power));
}

// PairType = 'token->token'
// SwapType = 'swapExactOut'
export function _tokenInForExactTokenOut(
    balanceIn: bigint,
    weightIn: bigint,
    balanceOut: bigint,
    weightOut: bigint,
    amountOut: bigint,
    fee: bigint
): bigint {
    const base = MathSol.divUpFixed(balanceOut, balanceOut - amountOut);
    const exponent = MathSol.divUpFixed(weightOut, weightIn);
    const power = MathSol.powUpFixed(base, exponent);
    const ratio = MathSol.sub(power, MathSol.ONE);
    const amountIn = MathSol.mulUpFixed(balanceIn, ratio);
    return addFee(amountIn, fee);
}

function subtractFee(amount: bigint, fee: bigint): bigint {
    const feeAmount = MathSol.mulUpFixed(amount, fee);
    return amount - feeAmount;
}

function addFee(amount: bigint, fee: bigint): bigint {
    return MathSol.divUpFixed(amount, MathSol.complementFixed(fee));
}

/////////
/// SpotPriceAfterSwap
/////////

// PairType = 'token->token'
// SwapType = 'swapExactIn'
export function _spotPriceAfterSwapExactTokenInForTokenOut(
    balanceIn: bigint,
    weightIn: bigint,
    balanceOut: bigint,
    weightOut: bigint,
    amountIn: bigint,
    fee: bigint
): bigint {
    const numerator = MathSol.mulUpFixed(balanceIn, weightOut);
    let denominator = MathSol.mulUpFixed(balanceOut, weightIn);
    const feeComplement = MathSol.complementFixed(fee);
    denominator = MathSol.mulUpFixed(denominator, feeComplement);
    const base = MathSol.divUpFixed(
        balanceIn,
        MathSol.add(MathSol.mulUpFixed(amountIn, feeComplement), balanceIn)
    );
    const exponent = MathSol.divUpFixed(weightIn + weightOut, weightOut);
    denominator = MathSol.mulUpFixed(
        denominator,
        MathSol.powUpFixed(base, exponent)
    );
    return MathSol.divUpFixed(numerator, denominator);
    //        -(
    //            (Bi * wo) /
    //            (Bo * (-1 + f) * (Bi / (Ai + Bi - Ai * f)) ** ((wi + wo) / wo) * wi)
    //        )
}

// PairType = 'token->token'
// SwapType = 'swapExactOut'
export function _spotPriceAfterSwapTokenInForExactTokenOut(
    balanceIn: bigint,
    weightIn: bigint,
    balanceOut: bigint,
    weightOut: bigint,
    amountOut: bigint,
    fee: bigint
): bigint {
    let numerator = MathSol.mulUpFixed(balanceIn, weightOut);
    const feeComplement = MathSol.complementFixed(fee);
    const base = MathSol.divUpFixed(
        balanceOut,
        MathSol.sub(balanceOut, amountOut)
    );
    const exponent = MathSol.divUpFixed(weightIn + weightOut, weightIn);
    numerator = MathSol.mulUpFixed(
        numerator,
        MathSol.powUpFixed(base, exponent)
    );
    const denominator = MathSol.mulUpFixed(
        MathSol.mulUpFixed(balanceOut, weightIn),
        feeComplement
    );
    return MathSol.divUpFixed(numerator, denominator);
    //        -(
    //            (Bi * (Bo / (-Ao + Bo)) ** ((wi + wo) / wi) * wo) /
    //            (Bo * (-1 + f) * wi)
    //        )
}